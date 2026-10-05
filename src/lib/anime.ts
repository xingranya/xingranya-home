interface SearchableAnime {
  id: string;
  title: string;
  subtitle: string;
  englishTitle: string;
  year: number;
  version: string;
  tags: string[];
  publishDate: string | null;
}

// 忽略大小写、全半角和标点差异；空格仍用来分隔组合关键词。
const fold = (text: string) => text.normalize('NFKC').toLowerCase().replace(/\p{White_Space}/gu, '');
const normalize = (text: string) => fold(text).replace(/[\p{P}\p{S}]/gu, '');
const newestFirst = (a: SearchableAnime, b: SearchableAnime) =>
  b.year - a.year || (b.publishDate || '').localeCompare(a.publishDate || '');

export function searchAnime<T extends SearchableAnime>(items: readonly T[], query: string) {
  const terms = [...new Set(query.trim().split(/\s+/u).map(normalize).filter(Boolean))];
  return items.flatMap((item) => {
    const fields = [
      { value: item.title, weight: 100, label: '' },
      ...[item.subtitle, item.englishTitle].flatMap((value) => value.split(/[、\n]/u))
        .filter(Boolean).map((value) => ({ value, weight: 70, label: `别名：${value}` })),
      { value: String(item.year), weight: 50, label: `年份：${item.year}` },
      { value: item.version, weight: 45, label: `类型：${item.version}` },
      ...item.tags.map((value) => ({ value, weight: 30, label: `标签：${value}` })),
    ].map((field) => ({ ...field, normalized: normalize(field.value) }));
    const matches = terms.map((term) => fields.flatMap((field) => {
      // 四位年份以首播字段为准，避免来源标签里的旧年份混入结果。
      if (/^\d{4}$/u.test(term) && field.weight !== 50) return [];
      // 单字可查片名和别名；标签只接受完整单字，避免“花”命中声优姓名。
      if (!field.normalized.includes(term) ||
        (field.weight === 30 && term.length === 1 && field.normalized !== term)) return [];
      const bonus = field.normalized === term ? 20 : field.normalized.startsWith(term) ? 10 : 0;
      return [{ score: field.weight + bonus, label: field.label }];
    }).sort((a, b) => b.score - a.score)[0]).filter((match) => match !== undefined);
    if (matches.length !== terms.length) return [];
    return [{
      item,
      // 保留完整片名中的季数符号含义，例如“∬”“＊”，精确标题始终优先。
      score: matches.reduce((sum, match) => sum + match.score, 0) + (fold(item.title) === fold(query) ? 200 : 0),
      matchLabel: [...new Set(matches.map((match) => match.label).filter(Boolean))].join(' · '),
    }];
  }).sort((a, b) => b.score - a.score || newestFirst(a.item, b.item));
}

export function getAnimeSynopsis(
  item: { id: string; description: string },
  translations: Record<string, string>,
) {
  const source = item.description.replace(/\r\n/g, '\n').trim();
  if (source.includes('[中文简介]')) {
    const [original, description] = source.split('[中文简介]');
    return { description: description.trim(), original: original.trim() };
  }
  if (source.includes('[简介原文]')) {
    const [description, original] = source.split('[简介原文]');
    return { description: description.trim(), original: original.trim() };
  }
  const firstParagraph = source.split(/\n\s*\n/u)[0];
  if (translations[item.id] && /[ぁ-ゖァ-ヺ]/u.test(firstParagraph)) {
    return { description: translations[item.id], original: source };
  }
  return { description: source, original: '' };
}
