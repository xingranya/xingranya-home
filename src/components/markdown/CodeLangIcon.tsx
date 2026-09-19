import React from 'react';

interface CodeLangIconProps {
  lang?: string;
  filename?: string;
  className?: string;
  size?: number;
}

// 1. React (TSX / JSX)
const ReactLangIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg
    viewBox="-14 -14 28 28"
    width={size}
    height={size}
    className={className}
    style={{ overflow: 'visible' }}
  >
    <circle cx="0" cy="0" r="2.2" fill="#61DAFB" />
    <g stroke="#61DAFB" strokeWidth="1.1" fill="none">
      <ellipse rx="10.5" ry="4.2" />
      <ellipse rx="10.5" ry="4.2" transform="rotate(60)" />
      <ellipse rx="10.5" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

// 2. TypeScript (TS)
const TypeScriptLangIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <rect width="24" height="24" rx="3.5" fill="#3178C6" />
    <path
      fill="#FFFFFF"
      d="M11.75 10.45H8.7v8.5H6.55v-8.5H3.5V8.65h8.25v1.8zm3.28 6.42c.74.45 1.57.7 2.41.7 1.34 0 2.13-.67 2.13-1.63 0-.91-.56-1.42-1.96-1.95-1.78-.66-2.91-1.46-2.91-3.13 0-1.76 1.4-3.08 3.59-3.08 1.05 0 2.01.27 2.76.73l-.68 1.76c-.6-.37-1.34-.58-2.08-.58-1.07 0-1.76.58-1.76 1.37 0 .86.58 1.3 2.06 1.87 1.83.69 2.83 1.57 2.83 3.23 0 1.94-1.47 3.2-3.82 3.2-1.22 0-2.39-.33-3.23-.88l.66-1.64z"
    />
  </svg>
);

// 3. JavaScript (JS)
const JavaScriptIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <rect width="24" height="24" rx="3.5" fill="#F7DF1E" />
    <path
      fill="#000000"
      d="M6.75 18.25c.5.85 1.45 1.4 2.65 1.4 1.55 0 2.5-.8 2.5-2.5v-7.3h-2.1v7.25c0 .65-.35 1-.95 1-.55 0-.9-.35-1.15-.85l-1 1zm7.4 1.35c1.45 0 2.6-.7 3.15-1.8l-1.65-1c-.35.65-.85.95-1.5.95-.8 0-1.35-.45-1.35-1.15 0-.8.6-1.15 1.7-1.6 2-.8 2.95-1.6 2.95-3.2 0-1.8-1.4-3.05-3.35-3.05-1.45 0-2.65.65-3.3 1.9l1.6 1c.35-.6.75-.95 1.6-.95.7 0 1.25.4 1.25 1 0 .7-.55 1-1.6 1.45-1.9.8-3.05 1.6-3.05 3.35 0 1.85 1.35 3.1 3.2 3.1z"
    />
  </svg>
);

// 4. Python
const PythonLangIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path
      fill="#3776AB"
      d="M11.914 0C5.833 0 6.2 2.645 6.2 2.645l.006 2.74h5.815v.825H3.88s-3.88.441-3.88 6.287c0 5.848 3.39 5.632 3.39 5.632h2.024v-2.836s-.11-3.39 3.33-3.39h5.727s3.22-.053 3.22-3.167V3.167S18.15 0 11.914 0zM8.7 1.711a1.002 1.002 0 1 1 0 2.004 1.002 1.002 0 0 1 0-2.004z"
    />
    <path
      fill="#FFD438"
      d="M12.086 24c6.081 0 5.714-2.645 5.714-2.645l-.006-2.74H11.98v-.825h8.14s3.88-.441 3.88-6.287c0-5.848-3.39-5.632-3.39-5.632h-2.024v2.836s.11 3.39-3.33 3.39H9.529s-3.22.053-3.22 3.167v5.568S5.85 24 12.086 24zm3.214-1.711a1.002 1.002 0 1 1 0-2.004 1.002 1.002 0 0 1 0 2.004z"
    />
  </svg>
);

// 5. Go
const GoLangIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path
      fill="#00ADD8"
      d="M1.811 10.231c.145-.584.453-1.077.925-1.479.472-.401 1.054-.602 1.746-.602.827 0 1.503.284 2.029.851.526.568.789 1.347.789 2.338 0 .973-.263 1.747-.789 2.323-.526.575-1.202.863-2.029.863-.692 0-1.274-.201-1.746-.602-.472-.402-.78-.895-.925-1.479H0c.164.93.593 1.696 1.288 2.299.695.602 1.558.903 2.589.903 1.229 0 2.222-.423 2.979-1.269.757-.846 1.136-1.956 1.136-3.33 0-1.356-.379-2.457-1.136-3.303C6.099 7.945 5.106 7.522 3.877 7.522c-1.031 0-1.894.301-2.589.903C.593 9.028.164 9.794 0 10.724h1.811v-.493zm7.042 1.401c0-1.374.379-2.484 1.136-3.33.757-.846 1.75-1.269 2.979-1.269 1.229 0 2.222.423 2.979 1.269.757.846 1.136 1.956 1.136 3.33 0 1.374-.379 2.484-1.136 3.33-.757.846-1.75 1.269-2.979 1.269-1.229 0-2.222-.423-2.979-1.269-.757-.846-1.136-1.956-1.136-3.33zm1.865 0c0 .991.263 1.77.789 2.338.526.568 1.202.851 2.029.851.827 0 1.503-.284 2.029-.851.526-.568.789-1.347.789-2.338 0-.991-.263-1.77-.789-2.338-.526-.568-1.202-.851-2.029-.851-.827 0-1.503.284-2.029.851-.526.568-.789 1.347-.789 2.338zm10.78-4.11h-4.301v1.656h4.301v-1.656zm-1.894 2.65h-2.407v1.656h2.407v-1.656zm1.894 2.65h-4.301v1.656h4.301v-1.656z"
    />
  </svg>
);

// 6. Rust
const RustLangIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path
      fill="#CE422B"
      d="M23.834 11.233a1.442 1.442 0 0 0-.256-.474l-1.46-1.758a.485.485 0 0 1-.09-.271l.035-2.285a1.464 1.464 0 0 0-.411-1.077 1.464 1.464 0 0 0-1.09-.379l-2.28.188a.486.486 0 0 1-.274-.084L16.27 3.86a1.463 1.463 0 0 0-1.127-.247 1.46 1.46 0 0 0-.923.633l-1.23 1.93a.486.486 0 0 1-.264.186L10.45 6.84a1.465 1.465 0 0 0-1.144.154 1.465 1.465 0 0 0-.67.901l-.707 2.176a.486.486 0 0 1-.202.247l-1.996 1.118a1.463 1.463 0 0 0-.743.838 1.46 1.46 0 0 0 .108 1.15l1.096 2.012a.486.486 0 0 1 .046.316l-.427 2.247a1.464 1.464 0 0 0 .285 1.12 1.463 1.463 0 0 0 1.042.5l2.285-.09a.486.486 0 0 1 .28.064l1.83 1.365a1.464 1.464 0 0 0 1.14.2 1.46 1.46 0 0 0 .888-.68l1.17-1.968a.486.486 0 0 1 .27-.179l2.253-.42a1.465 1.465 0 0 0 1.13-.223 1.464 1.464 0 0 0 .61-.944l.643-2.197a.485.485 0 0 1 .212-.24l1.964-1.176a1.46 1.46 0 0 0 .69-.876 1.46 1.46 0 0 0-.156-1.144zm-14.7 2.45a3.834 3.834 0 0 1 1.704-5.26 3.834 3.834 0 0 1 5.097 1.636l-1.634.945a1.956 1.956 0 0 0-2.6-836 1.956 1.956 0 0 0-.87 2.685l-1.697.83zm8.384 4.542l-2.022-2.316a3.834 3.834 0 0 1-3.696.618l.848-1.684a1.956 1.956 0 0 0 1.886-.316l1.97 2.256a.82.82 0 0 1-1.014 1.442l-.847-1.684.875-1.737z"
    />
  </svg>
);

// 7. HTML5
const HtmlIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path fill="#E34F26" d="M3 2l1.6 18.2L12 23l7.4-2.8L21 2H3z" />
    <path fill="#EF652A" d="M12 3.8v17.4l5.9-2.2L19.2 3.8H12z" />
    <path
      fill="#FFFFFF"
      d="M7.4 6.8h9.2l-.2 2.3H9.8l.2 2.4h6.8l-.6 6.3-4.2 1.2-4.2-1.2-.3-3.3h2.3l.1 1.6 2.1.6 2.1-.6.2-2.3H7.1L7.4 6.8z"
    />
  </svg>
);

// 8. CSS3 / SCSS
const CssIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path fill="#1572B6" d="M3 2l1.6 18.2L12 23l7.4-2.8L21 2H3z" />
    <path fill="#33A9DC" d="M12 3.8v17.4l5.9-2.2L19.2 3.8H12z" />
    <path
      fill="#FFFFFF"
      d="M12 6.8H7.4l.2 2.3h4.4v-2.3zm0 4.7H9.8l.2 2.4h2v-2.4zm0 4.9l-.1.03-2.1-.6-.1-1.6H7.3l.3 3.3 4.4 1.2V16.4zm4.6-9.6H12v2.3h4.4l-.4 4.7H12v2.4h1.8l-.2 2.3-1.6.4v2.4l4.2-1.2.6-8.9.2-4.3z"
    />
  </svg>
);

// 9. JSON
const JsonIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <rect width="24" height="24" rx="3.5" fill="#292D3E" />
    <path
      fill="#FBC02D"
      d="M7 8c-.6 0-1 .4-1 1v2c0 .6-.4 1-1 1 .6 0 1 .4 1 1v2c0 .6.4 1 1 1h1v-1.5H7.5v-1.8c0-.7-.5-1.2-1.2-1.2.7 0 1.2-.5 1.2-1.2V9.5H8V8H7zm10 0h-1v1.5h.5v1.8c0 .7.5 1.2 1.2 1.2-.7 0-1.2.5-1.2 1.2v1.8H16V17h1c.6 0 1-.4 1-1v-2c0-.6.4-1 1-1-.6 0-1-.4-1-1V9c0-.6-.4-1-1-1z"
    />
  </svg>
);

// 10. YAML / YML
const YamlIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <rect width="24" height="24" rx="3.5" fill="#CB171E" />
    <path
      fill="#FFFFFF"
      d="M5.5 6.5l2.5 4.5v5.5h2v-5.5l2.5-4.5h-2.2l-1.3 2.8-1.3-2.8H5.5zm8 0l1.8 7.5h1.7l1.8-7.5h-1.8l-.9 4.8-.9-4.8h-1.7z"
    />
  </svg>
);

// 11. Markdown
const MarkdownIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <rect width="24" height="24" rx="3.5" fill="#083FA1" />
    <path
      fill="#FFFFFF"
      d="M4 7.5h2.2l2.3 2.9 2.3-2.9H13v9h-2.2v-5l-2 2.5-2-2.5v5H4v-9zm12.5 0h2.2v4.8h2.3l-3.4 4.2-3.4-4.2h2.3V7.5z"
    />
  </svg>
);

// 12. Shell / Bash / Terminal / PowerShell
const ShellIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <rect width="24" height="24" rx="3.5" fill="#1E293B" />
    <path
      fill="#4ADE80"
      d="M6 7.5l4.5 4.5L6 16.5l1.5 1.5 6-6-6-6L6 7.5zm7.5 9h6v2h-6v-2z"
    />
  </svg>
);

// 13. SQL / Database
const SqlIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path
      fill="#00758F"
      d="M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4zm0 2c4.42 0 8 1.34 8 2s-3.58 2-8 2-8-1.34-8-2 3.58-2 8-2zm0 6c4.42 0 8 1.34 8 2s-3.58 2-8 2-8-1.34-8-2v-1.77C18.25 11.45 15.34 12 12 12s-6.25-.55-8-1.77V10zm0 6c4.42 0 8 1.34 8 2s-3.58 2-8 2-8-1.34-8-2v-1.77C18.25 17.45 15.34 18 12 18s-6.25-.55-8-1.77V16z"
    />
  </svg>
);

// 14. Docker
const DockerLangIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path
      fill="#2496ED"
      d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H2.208a.186.186 0 0 0-.186.185v1.888c0 .102.084.185.186.185m21.758 1.488c-.687-.417-2.115-.467-3.085-.133-.186-.77-.734-1.393-1.442-1.785l-.47-.26-.307.44c-.75 1.074-.757 2.457-.02 3.528-.43.238-.973.376-1.572.376H1.473a.473.473 0 0 0-.473.473c0 1.25.297 2.477.868 3.57 1.418 2.709 4.148 4.542 7.234 4.854 1.02.103 2.054.084 3.067-.058 3.553-.497 6.643-2.613 8.358-5.727.674-1.226.963-2.502.963-3.766a4.84 4.84 0 0 0-.524-1.512z"
    />
  </svg>
);

// 15. Nginx
const NginxLangIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path
      fill="#009639"
      d="M12 0L1.6 6v12L12 24l10.4-6V6L12 0zm-1.8 17.5l-3.6-4.6v4.6H4.8V6.5h1.8l3.6 4.6V6.5h1.8v11H10.2zm9 0h-1.8l-3.6-4.6v4.6h-1.8V6.5h1.8l3.6 4.6V6.5h1.8v11z"
    />
  </svg>
);

// 16. Vue
const VueIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <path fill="#41B883" d="M2 3h4.5l5.5 9.5L17.5 3H22L12 21 2 3z" />
    <path fill="#35495E" d="M6.5 3h3.5l2 3.5 2-3.5h3.5L12 11.5 6.5 3z" />
  </svg>
);

// 17. C / C++
const CppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ overflow: 'visible' }}>
    <rect width="24" height="24" rx="3.5" fill="#00599C" />
    <path
      fill="#FFFFFF"
      d="M10.8 7.4c-2.8 0-4.6 1.9-4.6 4.6s1.8 4.6 4.6 4.6c1.6 0 2.9-.6 3.7-1.6l-1.4-1.1c-.5.6-1.3 1-2.3 1-1.7 0-2.8-1.2-2.8-2.9s1.1-2.9 2.8-2.9c1 0 1.8.4 2.3 1l1.4-1.1c-.8-1-2.1-1.6-3.7-1.6zm5 3.1h1.1V9.4h1.1v1.1h1.1v1.1h-1.1v1.1h-1.1v-1.1h-1.1v-1.1zm3.8 0h1.1V9.4h1.1v1.1h1.1v1.1h-1.1v1.1h-1.1v-1.1h-1.1v-1.1z"
    />
  </svg>
);

// 18. 默认代码图标 (Generic Code)
const GenericCodeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 15, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ overflow: 'visible' }}
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const CodeLangIcon: React.FC<CodeLangIconProps> = ({
  lang,
  filename,
  className,
  size = 15,
}) => {
  const getNormalizedKey = (): string => {
    const raw = (lang || '').toLowerCase().trim();
    
    if (filename && filename.includes('.')) {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext) {
        if (['ts', 'mts', 'cts'].includes(ext)) return 'typescript';
        if (['tsx', 'jsx'].includes(ext)) return 'react';
        if (['js', 'mjs', 'cjs'].includes(ext)) return 'javascript';
        if (['py', 'pyw'].includes(ext)) return 'python';
        if (['go'].includes(ext)) return 'go';
        if (['rs'].includes(ext)) return 'rust';
        if (['html', 'htm'].includes(ext)) return 'html';
        if (['css', 'scss', 'sass', 'less'].includes(ext)) return 'css';
        if (['json', 'jsonc', 'json5'].includes(ext)) return 'json';
        if (['yaml', 'yml'].includes(ext)) return 'yaml';
        if (['md', 'markdown', 'mdx'].includes(ext)) return 'markdown';
        if (['sh', 'bash', 'zsh'].includes(ext)) return 'bash';
        if (['ps1', 'pwsh'].includes(ext)) return 'powershell';
        if (['sql'].includes(ext)) return 'sql';
        if (['dockerfile', 'dockerignore'].includes(ext) || filename.toLowerCase().startsWith('dockerfile')) return 'docker';
        if (['nginx', 'conf'].includes(ext)) return 'nginx';
        if (['vue'].includes(ext)) return 'vue';
        if (['c', 'h', 'cpp', 'hpp', 'cc', 'cxx'].includes(ext)) return 'cpp';
      }
    }

    if (['ts', 'typescript'].includes(raw)) return 'typescript';
    if (['tsx', 'jsx', 'react'].includes(raw)) return 'react';
    if (['js', 'javascript', 'mjs', 'cjs'].includes(raw)) return 'javascript';
    if (['py', 'python'].includes(raw)) return 'python';
    if (['go', 'golang'].includes(raw)) return 'go';
    if (['rs', 'rust'].includes(raw)) return 'rust';
    if (['html', 'htm'].includes(raw)) return 'html';
    if (['css', 'scss', 'sass', 'less'].includes(raw)) return 'css';
    if (['json', 'jsonc', 'json5'].includes(raw)) return 'json';
    if (['yaml', 'yml'].includes(raw)) return 'yaml';
    if (['md', 'markdown', 'mdx'].includes(raw)) return 'markdown';
    if (['sh', 'bash', 'zsh', 'shell'].includes(raw)) return 'bash';
    if (['powershell', 'pwsh', 'cmd'].includes(raw)) return 'powershell';
    if (['sql', 'mysql', 'postgres', 'postgresql', 'sqlite'].includes(raw)) return 'sql';
    if (['docker', 'dockerfile'].includes(raw)) return 'docker';
    if (['nginx'].includes(raw)) return 'nginx';
    if (['vue'].includes(raw)) return 'vue';
    if (['c', 'cpp', 'c++'].includes(raw)) return 'cpp';

    return raw;
  };

  const key = getNormalizedKey();

  switch (key) {
    case 'typescript':
      return <TypeScriptLangIcon size={size} className={className} />;
    case 'react':
      return <ReactLangIcon size={size} className={className} />;
    case 'javascript':
      return <JavaScriptIcon size={size} className={className} />;
    case 'python':
      return <PythonLangIcon size={size} className={className} />;
    case 'go':
      return <GoLangIcon size={size} className={className} />;
    case 'rust':
      return <RustLangIcon size={size} className={className} />;
    case 'html':
      return <HtmlIcon size={size} className={className} />;
    case 'css':
      return <CssIcon size={size} className={className} />;
    case 'json':
      return <JsonIcon size={size} className={className} />;
    case 'yaml':
      return <YamlIcon size={size} className={className} />;
    case 'markdown':
      return <MarkdownIcon size={size} className={className} />;
    case 'bash':
    case 'powershell':
      return <ShellIcon size={size} className={className} />;
    case 'sql':
      return <SqlIcon size={size} className={className} />;
    case 'docker':
      return <DockerLangIcon size={size} className={className} />;
    case 'nginx':
      return <NginxLangIcon size={size} className={className} />;
    case 'vue':
      return <VueIcon size={size} className={className} />;
    case 'cpp':
      return <CppIcon size={size} className={className} />;
    default:
      return <GenericCodeIcon size={size} className={className} />;
  }
};
