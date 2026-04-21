import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const PLACEHOLDER_CONTENT = '还沒写，咕咕\n';
const workspaceRoot = path.resolve(import.meta.dirname, '..', '..', '..');
const indexYamlPath = path.join(workspaceRoot, 'calendar', 'data', 'official', 'index.yaml');
const indexJsonPath = path.join(workspaceRoot, 'calendar', 'data', 'official', 'index.json');
const generatedLoaderPath = path.join(workspaceRoot, 'src', 'calendar-float', 'official-data-loader.generated.ts');

function normalizePath(filePath) {
  return String(filePath || '')
    .trim()
    .replaceAll('\\', '/');
}

function assertCalendarPath(filePath) {
  if (!filePath.startsWith('calendar/')) {
    throw new Error(`官方内容文件路径必须以 calendar/ 开头：${filePath}`);
  }
}

function toLoaderImportPath(filePath) {
  assertCalendarPath(filePath);
  return `../../${filePath}?raw`;
}

function toAbsolutePath(filePath) {
  assertCalendarPath(filePath);
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
  return parsed;
}

function collectContentFiles(indexData) {
  return Array.from(
    new Set(
      [...indexData.festivals.map(item => item.content_file), ...indexData.books.map(item => item.content_file)]
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

function buildGeneratedLoaderSource(contentFiles) {
  const importLines = contentFiles.map((filePath, index) => {
    return `import content${index} from ${JSON.stringify(toLoaderImportPath(filePath))};`;
  });

  const contentMapLines = contentFiles.map((filePath, index) => {
    return `  ${JSON.stringify(filePath)}: content${index},`;
  });

  return [
    "import officialIndex from '../../calendar/data/official/index.json';",
    ...importLines,
    "import type { OfficialIndexFile } from './types';",
    '',
    'const officialIndexData = officialIndex as OfficialIndexFile;',
    '',
    'const contentMap: Record<string, string> = {',
    ...contentMapLines,
    '};',
    '',
    'const referencedContentFiles = new Set(',
    '  [...officialIndexData.festivals.map(item => item.content_file), ...officialIndexData.books.map(item => item.content_file)]',
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
  ].join('\n');
}

function main() {
  const indexData = loadIndexYaml();
  validateRelatedBooks(indexData);

  const contentFiles = collectContentFiles(indexData);
  const createdFiles = contentFiles.filter(filePath => ensurePlaceholderFile(filePath));

  fs.writeFileSync(indexJsonPath, `${JSON.stringify(indexData, null, 2)}\n`, 'utf8');
  fs.writeFileSync(generatedLoaderPath, buildGeneratedLoaderSource(contentFiles), 'utf8');

  console.info(`[calendar-official] 已同步索引：${path.relative(workspaceRoot, indexYamlPath)}`);
  console.info(`[calendar-official] 已生成 JSON：${path.relative(workspaceRoot, indexJsonPath)}`);
  console.info(`[calendar-official] 已生成 loader：${path.relative(workspaceRoot, generatedLoaderPath)}`);
  if (createdFiles.length > 0) {
    console.info(`[calendar-official] 已补齐占位正文：${createdFiles.join(', ')}`);
  }
}

main();
