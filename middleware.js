import { validPageRoutes } from './src/content/generated/valid-routes.js';

const pageRoutes = new Set(validPageRoutes);
const legacyRoutes = [
  /^\/timeline\/?$/,
  /^\/archive\/?$/,
  /^\/journal(?:\/[^/]+)?\/?$/,
  /^\/shouji(?:\/[^/]+)?\/?$/,
  /^\/record\/?$/,
  /^\/friend\/?$/,
];

function normalizePath(pathname) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function isPublicFile(pathname) {
  return /\/[^/]+\.[^/]+$/.test(pathname);
}

export async function middleware({ request, next }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);
  const isLegacyRoute = legacyRoutes.some((pattern) => pattern.test(url.pathname));

  if (pageRoutes.has(pathname) || pathname === '/404.html' || isLegacyRoute || isPublicFile(pathname)) {
    return next();
  }

  const notFoundResponse = await fetch(new URL('/404.html', url.origin));
  return new Response(request.method === 'HEAD' ? null : await notFoundResponse.arrayBuffer(), {
    status: 404,
    headers: notFoundResponse.headers,
  });
}

export const config = {
  matcher: ['/:path*'],
};
