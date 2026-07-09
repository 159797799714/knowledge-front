// 时间格式化
export const formatTime = (timestamp?: number): string => {
  if (!timestamp) {
    return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// HTML转义
export const escapeHtml = (str: string): string => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 判断是否为图片URL
export const isImageUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(u.pathname);
  } catch (e) {
    return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(url || '');
  }
};

// 标准化URL
export const normalizeUrl = (rawUrl: string): string => {
  const s = String(rawUrl || '').trim();
  if (!s) return '';
  return s.replace(/\s/g, '%20');
};

// 去重并保持顺序
export const dedupeKeepOrder = (arr: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    const v = String(x || '');
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
};

// 提取URL
export const extractUrlsLoose = (text: string): string[] => {
  const s = String(text || '');
  const regex = /(https?:\/\/[^\s]+)/g;
  const matches = s.match(regex) || [];
  const urls: string[] = [];

  const trimTailPunct = (u: string) => String(u || '').replace(/[)\]}'">，。,;；\]】）＞]+$/g, '');
  const trimHeadPunct = (u: string) => String(u || '').replace(/^[<([{'"]+|^[＜（【\[]+/g, '');

  for (const m of matches) {
    let u = trimHeadPunct(trimTailPunct(m));
    if (u) urls.push(u);
  }
  return dedupeKeepOrder(urls);
};

// 查找最后的图片标记
export const findLastImageMarkerIndex = (raw: string): { idx: number; len: number } => {
  const s = String(raw || '');
  const re = /【\s*图片\s*】|\[\s*图片\s*\]/g;
  let m;
  let lastIdx = -1;
  let lastLen = 0;
  while ((m = re.exec(s)) !== null) {
    lastIdx = m.index;
    lastLen = m[0].length;
  }
  return { idx: lastIdx, len: lastLen };
};

// 解析答案和图片
export interface ParsedAnswer {
  text: string;
  images: string[];
}

export const parseAnswerAndImages = (text: string): ParsedAnswer => {
  const raw = String(text || '');
  const { idx, len } = findLastImageMarkerIndex(raw);
  if (idx === -1) return { text: raw, images: [] };

  const before = raw.slice(0, idx).trimEnd();
  const after = raw.slice(idx + len).trim();
  const urls: string[] = [];

  // 按行解析URL
  const lines = after.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith('http://') || line.startsWith('https://')) {
      urls.push(line);
    } else {
      const matches = extractUrlsLoose(line);
      for (const u of matches) {
        urls.push(u);
      }
    }
  }

  // 去重并过滤图片链接
  const seen = new Set<string>();
  const images: string[] = [];
  for (const u of urls) {
    const normalized = normalizeUrl(u);
    if (!isImageUrl(normalized)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    images.push(normalized);
  }
  return { text: before, images };
};

// 从文本中提取所有图片URL
export const extractAllImages = (text: string): string[] => {
  const looseImages = extractUrlsLoose(text).map(normalizeUrl).filter(isImageUrl);
  return dedupeKeepOrder(looseImages);
};

// 判断是否应该显示图片
export const shouldShowImagesByAnswer = (answerText: string): boolean => {
  const t = String(answerText || '');
  const keywords = [
    '如图', '如下图', '见图', '见下图', '下图', '上图',
    '图片', '示意图', '结构图', '外观', '接线图', '电路图', '原理图', '安装图', '尺寸图', '截图'
  ];
  return keywords.some(k => t.includes(k));
};
