import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: { entry: { ssg: './src/ssg.tsx' } },
  performance: { chunkSplit: { strategy: 'all-in-one' }, printFileSize: false },
  output: { target: 'node', distPath: { root: '.ssg' }, filename: { js: '[name].cjs' }, minify: false, copy: [] },
  tools: { rspack: { output: { library: { type: 'commonjs2' } }, module: { rules: [{ test: /\.md$/, type: 'asset/source' }] } } },
});
