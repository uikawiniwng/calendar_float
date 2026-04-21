import officialIndex from '../../calendar/data/official/index.json';
import content0 from "../../calendar/content/events/[event]幻沫假面祭.txt?raw";
import content1 from "../../calendar/content/events/[event]深蓝拍卖会.txt?raw";
import content2 from "../../calendar/content/events/[event]倾国倾城祭.txt?raw";
import content3 from "../../calendar/content/events/[event]赛瑞利亚摸鱼大赛.txt?raw";
import content4 from "../../calendar/content/events/[event]赛瑞利亚演奏会.txt?raw";
import content5 from "../../calendar/content/events/[event]赛瑞利亚灯海夜.txt?raw";
import content6 from "../../calendar/content/books/[BOOK]旅游宣发读物_幻沫与潮汐之恋.txt?raw";
import content7 from "../../calendar/content/books/[BOOK]旅游宣发读物_阿芙罗黛蒂之冠.txt?raw";
import content8 from "../../calendar/content/books/[BOOK]旅游宣发读物_深蓝拍卖会游客手册.txt?raw";
import content9 from "../../calendar/content/books/[BOOK]旅游宣发读物_赛瑞利亚摸鱼大赛观光指南.txt?raw";
import content10 from "../../calendar/content/books/[BOOK]旅游宣发读物_赛瑞利亚海岸演奏会导览.txt?raw";
import content11 from "../../calendar/content/books/[BOOK]旅游宣发读物_赛瑞利亚灯海夜祈愿手册.txt?raw";
import type { OfficialIndexFile } from './types';

const officialIndexData = officialIndex as OfficialIndexFile;

const contentMap: Record<string, string> = {
  "calendar/content/events/[event]幻沫假面祭.txt": content0,
  "calendar/content/events/[event]深蓝拍卖会.txt": content1,
  "calendar/content/events/[event]倾国倾城祭.txt": content2,
  "calendar/content/events/[event]赛瑞利亚摸鱼大赛.txt": content3,
  "calendar/content/events/[event]赛瑞利亚演奏会.txt": content4,
  "calendar/content/events/[event]赛瑞利亚灯海夜.txt": content5,
  "calendar/content/books/[BOOK]旅游宣发读物_幻沫与潮汐之恋.txt": content6,
  "calendar/content/books/[BOOK]旅游宣发读物_阿芙罗黛蒂之冠.txt": content7,
  "calendar/content/books/[BOOK]旅游宣发读物_深蓝拍卖会游客手册.txt": content8,
  "calendar/content/books/[BOOK]旅游宣发读物_赛瑞利亚摸鱼大赛观光指南.txt": content9,
  "calendar/content/books/[BOOK]旅游宣发读物_赛瑞利亚海岸演奏会导览.txt": content10,
  "calendar/content/books/[BOOK]旅游宣发读物_赛瑞利亚灯海夜祈愿手册.txt": content11,
};

const referencedContentFiles = new Set(
  [...officialIndexData.festivals.map(item => item.content_file), ...officialIndexData.books.map(item => item.content_file)]
    .map(filePath => String(filePath || '').trim().replaceAll('\\', '/'))
    .filter(Boolean),
);
const warnedMissingContentFiles = new Set<string>();

function warnMissingOfficialContent(filePath: string): void {
  if (!filePath || warnedMissingContentFiles.has(filePath)) {
    return;
  }
  warnedMissingContentFiles.add(filePath);
  console.warn(`[calendar-float] 官方索引引用的正文文件缺失或为空：${filePath}`);
}

referencedContentFiles.forEach(filePath => {
  if (!contentMap[filePath]) {
    warnMissingOfficialContent(filePath);
  }
});

export function getOfficialIndexData(): OfficialIndexFile {
  return officialIndexData;
}

export function getOfficialTextContent(filePath: string): string {
  const normalizedPath = String(filePath || '').trim().replaceAll('\\', '/');
  if (!normalizedPath) {
    return '';
  }

  const content = String(contentMap[normalizedPath] || '').trim();
  if (!content && referencedContentFiles.has(normalizedPath)) {
    warnMissingOfficialContent(normalizedPath);
  }
  return content;
}
