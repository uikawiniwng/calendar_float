import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const PLACEHOLDER_CONTENT = '还沒写，咕咕\n';
const REMINDER_SECTION_PREFIX = '@@section';
const workspaceRoot = path.resolve(import.meta.dirname, '..');
const indexYamlPath = path.join(workspaceRoot, 'public', 'assets', 'data', 'index.yaml');
const generatedLoaderPath = path.join(workspaceRoot, 'src', 'calendar-float', 'official-data-loader.generated.ts');

function normalizePath(filePath) {
  return String(filePath || '')
    .trim()
    .replaceAll('\\', '/');
}

function assertDataAssetPath(filePath) {
  if (!filePath.startsWith('public/assets/data/')) {
    throw new Error(`官方内容文件路径必须以 public/assets/data/ 开头：${filePath}`);
  }
}

function toLoaderImportPath(filePath) {
  assertDataAssetPath(filePath);
  return `../../${filePath}?raw`;
}

function toAbsolutePath(filePath) {
  assertDataAssetPath(filePath);
  return path.join(workspaceRoot, filePath);
}

function ensurePlaceholderFile(filePath) {
  const absolutePath = toAbsolutePath(filePath);
  if (fs.existsSync(absolutePath)) {
    return false;
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, PLACEHOLDER_CONTENT, 'utf8');
  return true;
}

function loadIndexYaml() {
  const content = fs.readFileSync(indexYamlPath, 'utf8');
  const parsed = YAML.parse(content) ?? {};
  parsed.festivals = Array.isArray(parsed.festivals) ? parsed.festivals : [];
  parsed.books = Array.isArray(parsed.books) ? parsed.books : [];
  parsed.reminder_groups = Array.isArray(parsed.reminder_groups) ? parsed.reminder_groups : [];
  parsed.month_aliases = Array.isArray(parsed.month_aliases) ? parsed.month_aliases : [];
  return parsed;
}

function collectContentFiles(indexData) {
  return Array.from(
    new Set(
      [
        ...indexData.festivals.map(item => item.content_file),
        ...indexData.books.map(item => item.content_file),
        ...indexData.reminder_groups.map(item => item.content_file),
      ]
        .map(filePath => normalizePath(filePath))
        .filter(Boolean),
    ),
  );
}

function validateRelatedBooks(indexData) {
  const bookIds = new Set(indexData.books.map(item => String(item?.id || '').trim()).filter(Boolean));
  const missingPairs = [];

  indexData.festivals.forEach(item => {
    const festivalId = String(item?.id || '').trim() || '(unknown_festival)';
    const relatedBooks = Array.isArray(item?.related_books) ? item.related_books : [];
    relatedBooks.forEach(bookId => {
      const normalizedBookId = String(bookId || '').trim();
      if (normalizedBookId && !bookIds.has(normalizedBookId)) {
        missingPairs.push(`${festivalId} -> ${normalizedBookId}`);
      }
    });
  });

  if (missingPairs.length > 0) {
    throw new Error(`存在未定义的 related_books：\n${missingPairs.join('\n')}`);
  }
}

function validateReminderGroups(indexData) {
  const duplicateGroupIds = [];
  const missingGroupRefs = [];
  const missingSectionRefs = [];
  const groupIds = new Set();

  indexData.reminder_groups.forEach(item => {
    const groupId = String(item?.id || '').trim();
    if (!groupId) {
      throw new Error('reminder_groups 中存在空 id');
    }
    if (groupIds.has(groupId)) {
      duplicateGroupIds.push(groupId);
      return;
    }
    groupIds.add(groupId);
  });

  indexData.festivals.forEach(item => {
    const festivalId = String(item?.id || '').trim() || '(unknown_festival)';
    const reminder = item?.reminder;
    if (!reminder || reminder.enabled === false) {
      return;
    }

    const groupId = String(reminder.group || '').trim();
    const sectionId = String(reminder.section_id || '').trim();
    if (!groupId || !groupIds.has(groupId)) {
      missingGroupRefs.push(`${festivalId} -> ${groupId || '(empty_group)'}`);
    }
    if (!sectionId) {
      missingSectionRefs.push(festivalId);
    }
  });

  if (duplicateGroupIds.length > 0 || missingGroupRefs.length > 0 || missingSectionRefs.length > 0) {
    throw new Error(
      [
        duplicateGroupIds.length > 0 ? `reminder_groups 存在重复 id：${duplicateGroupIds.join(', ')}` : '',
        missingGroupRefs.length > 0 ? `festival reminder 引用了未定义 group：\n${missingGroupRefs.join('\n')}` : '',
        missingSectionRefs.length > 0 ? `festival reminder 缺少 section_id：\n${missingSectionRefs.join('\n')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    );
  }
}

function parseReminderSections(filePath, content) {
  const normalizedContent = String(content || '').replace(/\r\n?/g, '\n');
  const lines = normalizedContent.split('\n');
  const sections = {};
  let currentSectionId = '';
  let buffer = [];

  const flush = () => {
    if (!currentSectionId) {
      return;
    }
    const sectionContent = buffer.join('\n').trim();
    sections[currentSectionId] = sectionContent;
    currentSectionId = '';
    buffer = [];
  };

  lines.forEach(line => {
    const match = line.match(/^@@section\s+(.+?)\s*$/);
    if (match) {
      const nextSectionId = String(match[1] || '').trim();
      if (!nextSectionId) {
        throw new Error(`提醒文件存在空 section id：${filePath}`);
      }
      if (Object.prototype.hasOwnProperty.call(sections, nextSectionId) || currentSectionId === nextSectionId) {
        throw new Error(`提醒文件存在重复 section id：${filePath} -> ${nextSectionId}`);
      }
      flush();
      currentSectionId = nextSectionId;
      return;
    }

    if (currentSectionId) {
      buffer.push(line);
    }
  });

  flush();
  return sections;
}

function buildReminderSectionMap(indexData) {
  const reminderSectionMap = {};

  indexData.reminder_groups.forEach(item => {
    const groupId = String(item?.id || '').trim();
    const filePath = normalizePath(item?.content_file);
    const content = fs.readFileSync(toAbsolutePath(filePath), 'utf8');
    reminderSectionMap[groupId] = parseReminderSections(filePath, content);
  });

  const missingSectionPairs = [];
  indexData.festivals.forEach(item => {
    const reminder = item?.reminder;
    if (!reminder || reminder.enabled === false) {
      return;
    }
    const festivalId = String(item?.id || '').trim() || '(unknown_festival)';
    const groupId = String(reminder.group || '').trim();
    const sectionId = String(reminder.section_id || '').trim();
    const sectionContent = String(reminderSectionMap[groupId]?.[sectionId] || '').trim();
    if (!sectionContent) {
      missingSectionPairs.push(`${festivalId} -> ${groupId}/${sectionId}`);
    }
  });

  if (missingSectionPairs.length > 0) {
    throw new Error(`存在未定义或空白的 reminder section：\n${missingSectionPairs.join('\n')}`);
  }

  return reminderSectionMap;
}

function buildGeneratedLoaderSource(indexData, contentFiles, reminderSectionMap) {
  const importLines = contentFiles.map((filePath, index) => {
    return `import content${index} from ${JSON.stringify(toLoaderImportPath(filePath))};`;
  });

  const contentMapLines = contentFiles.map((filePath, index) => {
    return `  ${JSON.stringify(filePath)}: content${index},`;
  });

  return [
    "import type { OfficialIndexFile } from './types';",
    ...importLines,
    '',
    `const officialIndexData = ${JSON.stringify(indexData, null, 2)} as OfficialIndexFile;`,
    '',
    'const contentMap: Record<string, string> = {',
    ...contentMapLines,
    '};',
    '',
    `const reminderSectionMap: Record<string, Record<string, string>> = ${JSON.stringify(reminderSectionMap, null, 2)};`,
    '',
    'const referencedContentFiles = new Set(',
    '  [',
    '    ...officialIndexData.festivals.map(item => item.content_file),',
    '    ...officialIndexData.books.map(item => item.content_file),',
    '    ...(officialIndexData.reminder_groups ?? []).map(item => item.content_file),',
    '  ]',
    "    .map(filePath => String(filePath || '').trim().replaceAll('\\\\', '/'))",
    '    .filter(Boolean),',
    ');',
    'const warnedMissingContentFiles = new Set<string>();',
    '',
    'function warnMissingOfficialContent(filePath: string): void {',
    '  if (!filePath || warnedMissingContentFiles.has(filePath)) {',
    '    return;',
    '  }',
    '  warnedMissingContentFiles.add(filePath);',
    '  console.warn(`[calendar-float] 官方索引引用的正文文件缺失或为空：${filePath}`);',
    '}',
    '',
    'referencedContentFiles.forEach(filePath => {',
    '  if (!contentMap[filePath]) {',
    '    warnMissingOfficialContent(filePath);',
    '  }',
    '});',
    '',
    'export function getOfficialIndexData(): OfficialIndexFile {',
    '  return officialIndexData;',
    '}',
    '',
    'export function getOfficialTextContent(filePath: string): string {',
    "  const normalizedPath = String(filePath || '').trim().replaceAll('\\\\', '/');",
    '  if (!normalizedPath) {',
    "    return '';",
    '  }',
    '',
    "  const content = String(contentMap[normalizedPath] || '').trim();",
    '  if (!content && referencedContentFiles.has(normalizedPath)) {',
    '    warnMissingOfficialContent(normalizedPath);',
    '  }',
    '  return content;',
    '}',
    '',
    'export function getOfficialReminderSectionContent(groupId: string, sectionId: string): string {',
    "  const normalizedGroupId = String(groupId || '').trim();",
    "  const normalizedSectionId = String(sectionId || '').trim();",
    '  if (!normalizedGroupId || !normalizedSectionId) {',
    "    return '';",
    '  }',
    "  return String(reminderSectionMap[normalizedGroupId]?.[normalizedSectionId] || '').trim();",
    '}',
    '',
    'export function getOfficialReminderSectionMap(groupId: string): Record<string, string> {',
    "  const normalizedGroupId = String(groupId || '').trim();",
    '  if (!normalizedGroupId) {',
    '    return {};',
    '  }',
    '  return { ...(reminderSectionMap[normalizedGroupId] ?? {}) };',
    '}',
    '',
  ].join('\n');
}

function main() {
  const indexData = loadIndexYaml();
  validateRelatedBooks(indexData);
  validateReminderGroups(indexData);

  const contentFiles = collectContentFiles(indexData);
  const createdFiles = contentFiles.filter(filePath => ensurePlaceholderFile(filePath));
  const reminderSectionMap = buildReminderSectionMap(indexData);

  fs.writeFileSync(
    generatedLoaderPath,
    buildGeneratedLoaderSource(indexData, contentFiles, reminderSectionMap),
    'utf8',
  );

  console.info(`[calendar-official] 已同步索引源：${path.relative(workspaceRoot, indexYamlPath)}`);
  console.info(`[calendar-official] 已生成 loader：${path.relative(workspaceRoot, generatedLoaderPath)}`);
  if (createdFiles.length > 0) {
    console.info(`[calendar-official] 已补齐占位正文：${createdFiles.join(', ')}`);
  }
  console.info(
    `[calendar-official] 已建立 reminder section 映射：${Object.values(reminderSectionMap).reduce((sum, sections) => sum + Object.keys(sections).length, 0)} 条`,
  );
}

main();
