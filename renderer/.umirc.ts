import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/find-in-page' },
    { path: '/app-update', component: '@/pages/app-update' },
  ],
  fastRefresh: {},
  history: {
    type: 'hash',
  },
  publicPath: './',
  copy: [
    {
      from: 'static',
      to: 'static',
    },
  ],
});
