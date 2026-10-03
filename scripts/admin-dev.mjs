import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const homeRoot = process.cwd();
const blogRoot = path.resolve(process.env.XINGRANYA_BLOG_ROOT || path.join(homeRoot, '../xingranya-blog'));
const homePort = Number(process.env.XINGRANYA_HOME_PORT || 3000);
const blogPort = Number(process.env.XINGRANYA_BLOG_PORT || 4000);
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];
let stopping = false;
if (![homePort, blogPort].every((port) => Number.isInteger(port) && port > 0 && port < 65536) || homePort === blogPort) {
  console.error('主页和博客端口需要是两个不同的有效端口。');
  process.exit(1);
}
const indexResult = spawnSync('node', ['scripts/generate-content-index.mjs'], { cwd: homeRoot, stdio: 'inherit' });
if (indexResult.status !== 0) process.exit(indexResult.status || 1);

function shutdown(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
}
function start(command, args, cwd, label, env = process.env) {
  const child = spawn(command, args, { cwd, stdio: 'inherit', env });
  children.push(child);
  child.on('error', (error) => { console.error(`[admin:${label}] ${error.message}`); process.exitCode = 1; shutdown(); });
  child.on('exit', (code) => { if (!stopping) { console.error(`[admin:${label}] 服务已退出（${code ?? '中止'}）。`); process.exitCode = code || 1; shutdown(); } });
}
start('node', ['node_modules/@rsbuild/core/bin/rsbuild.js', 'dev', '--host', '127.0.0.1', '--port', String(homePort)], homeRoot, '主页', { ...process.env, XINGRANYA_BLOG_PREVIEW_URL: `http://127.0.0.1:${blogPort}` });
if (process.env.XINGRANYA_SKIP_BLOG_PREVIEW !== '1') start(npmCommand, ['run', 'admin:local', '--', '-p', String(blogPort)], blogRoot, '博客');
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
console.log(`正在启动统一后台：主页 http://127.0.0.1:${homePort}/admin，博客 http://127.0.0.1:${blogPort}/。`);
