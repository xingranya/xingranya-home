import matter from 'gray-matter';
import type { Diary, Post, PostFrontmatter, TOCItem } from '../types';

export function generateHeadingId(text: string): string {
  const cleanText = text.replace(/[*_`#]/g, '').trim();
  const id = cleanText
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return id || 'section';
}

export function calculateReadingTime(content: string): { readingTime: string; wordCount: number } {
  const cleanContent = content.replace(/[#*`_()]|\[|\]/g, '').trim();
  const cjkCount = (cleanContent.match(/[\u4e00-\u9fa5]/g) || []).length;
  const nonCjkCount = (cleanContent.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\b\w+\b/g) || []).length;
  const totalWords = cjkCount + nonCjkCount;
  const minutes = Math.max(1, Math.ceil(totalWords / 300));
  return {
    readingTime: `${minutes} 分钟`,
    wordCount: totalWords,
  };
}

export function extractTOC(content: string): TOCItem[] {
  const lines = content.split('\n');
  const toc: TOCItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/[*_`]/g, '').trim();
      const id = generateHeadingId(cleanText);
      
      toc.push({
        id: id || `heading-${toc.length}`,
        text: cleanText,
        level,
      });
    }
  }

  return toc;
}

export function parseMarkdownFile(slug: string, rawContent: string): Post {
  const { data, content } = matter(rawContent);
  const frontmatter = data as Partial<PostFrontmatter> & Record<string, unknown>;
  const articleTitle = typeof frontmatter.title === 'string' ? frontmatter.title : slug;
  
  // 预先清洗重复首行标题，确保 TOC 和正文 DOM ID 绝对一致
  const cleanContent = stripDuplicateHeading(content, articleTitle);
  const { readingTime, wordCount } = calculateReadingTime(cleanContent);
  const toc = extractTOC(cleanContent);

  const finalCategory =
    frontmatter.category ||
    (Array.isArray(frontmatter.categories) && frontmatter.categories[0]) ||
    '技术文章';

  const coverImage =
    frontmatter.coverImage ||
    frontmatter.cover ||
    (Array.isArray(frontmatter.images) && frontmatter.images[0]) ||
    undefined;

  return {
    slug,
    title: typeof frontmatter.title === 'string' ? frontmatter.title : slug,
    date: frontmatter.date ? String(frontmatter.date) : new Date().toISOString().split('T')[0],
    summary: typeof frontmatter.summary === 'string'
      ? frontmatter.summary
      : content.slice(0, 150).replace(/[#*`_\n]/g, ' ') + '...',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    category: finalCategory,
    readingTime,
    wordCount,
    content,
    toc,
    draft: Boolean(frontmatter.draft),
    coverImage,
    recommend: typeof frontmatter.recommend === 'number' ? frontmatter.recommend : 0,
  };
}

export function parseDiaryFile(slug: string, rawContent: string): Diary {
  const { data, content } = matter(rawContent);
  const frontmatter = data as Partial<PostFrontmatter> & Record<string, unknown>;
  const { readingTime, wordCount } = calculateReadingTime(content);

  return {
    slug,
    title: typeof frontmatter.title === 'string' ? frontmatter.title : slug,
    date: frontmatter.date ? String(frontmatter.date) : new Date().toISOString().split('T')[0],
    time: typeof frontmatter.time === 'string' ? frontmatter.time : '',
    weather: typeof frontmatter.weather === 'string' ? frontmatter.weather : '晴',
    mood: typeof frontmatter.mood === 'string' ? frontmatter.mood : '平静',
    location: typeof frontmatter.location === 'string' ? frontmatter.location : '书房',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.filter((tag): tag is string => typeof tag === 'string') : ['手记'],
    summary: typeof frontmatter.summary === 'string'
      ? frontmatter.summary
      : content.slice(0, 120).replace(/[#*`_\n]/g, ' ') + '...',
    content,
    readingTime,
    wordCount,
  };
}

export function stripDuplicateHeading(content: string, title?: string): string {
  if (!content) return '';
  const trimmed = content.trim();
  if (trimmed.startsWith('# ')) {
    const lines = trimmed.split('\n');
    const firstHeading = lines[0].replace(/^#\s+/, '').trim();
    if (
      !title ||
      firstHeading === title.trim() ||
      firstHeading.toLowerCase() === title.trim().toLowerCase()
    ) {
      return lines.slice(1).join('\n').trim();
    }
  }
  return content;
}
