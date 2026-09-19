import type { Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

const SUPPORTED_LANGS = [
  'c',
  'cpp',
  'python',
  'rust',
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'bash',
  'sh',
  'json',
  'yaml',
  'markdown',
  'asm',
  'html',
  'css',
  'sql',
];

const THEMES = ['vitesse-light', 'vitesse-dark'];

export async function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: THEMES,
        langs: SUPPORTED_LANGS,
      })
    );
  }
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  lang: string = 'text',
  isDark: boolean = false
): Promise<string> {
  try {
    const highlighter = await getHighlighterInstance();
    const normalizedLang = lang.toLowerCase().trim();
    const validLang = SUPPORTED_LANGS.includes(normalizedLang) ? normalizedLang : 'text';
    const theme = isDark ? 'vitesse-dark' : 'vitesse-light';

    return highlighter.codeToHtml(code, {
      lang: validLang,
      theme,
    });
  } catch (error) {
    console.error('Shiki highlight failed:', error);
    // 回退纯文本转义 HTML
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="shiki"><code>${escaped}</code></pre>`;
  }
}
