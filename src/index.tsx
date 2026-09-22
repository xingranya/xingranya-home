import ReactDOM from 'react-dom/client';
import { Router } from 'wouter';
import { App } from './App';
import { setContentSnapshot, setLocalContentStore, type ContentSnapshot } from './content';
import './styles/index.css';
import './styles/wallpapers.css';

async function start() {
  const root = document.getElementById('root');
  if (!root) return;
  const encoded = document.getElementById('page-snapshot');
  if (encoded?.textContent) setContentSnapshot(JSON.parse(encoded.textContent) as ContentSnapshot);

  const local = ['localhost', '127.0.0.1', '[::1]', '0.0.0.0'].includes(window.location.hostname);
  const localAdmin = local && /^\/admin(?:\/|$)/.test(window.location.pathname);
  if (local && (process.env.NODE_ENV === 'development' || localAdmin)) {
    await import('./lib/buffer-polyfill');
    const { AdminStore } = await import('./lib/admin-store');
    setLocalContentStore(AdminStore);
  }

  const app = <Router><App /></Router>;
  if (root.hasChildNodes() && !localAdmin) ReactDOM.hydrateRoot(root, app);
  else ReactDOM.createRoot(root).render(app);
}

void start();
