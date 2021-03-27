import { defineConfig } from 'umi';
import theme from './src/theme';

export default defineConfig({
  title: '待办清单',
  qiankun: {
    slave: {},
  },
  fastRefresh: {},
  nodeModulesTransform: {
    type: 'none',
  },
  theme,
  routes: [
    {
      path: '/',
      component: '@/layouts/',
      routes: [
        { path: '/', redirect: '/task/' },
        { path: '/task/', component: 'task' },
        { path: '/history/', component: 'history' },
        // { redirect: '/record/' },
      ],
    },
  ],

  hash: true,
  base: '/to-do-list',
  publicPath: '/to-do-list/',
  runtimePublicPath: true,
  extraBabelPlugins: [
    [
      'babel-plugin-styled-components',
      {
        namespace: 'to-do-list',
      },
    ],
  ],
  externals: {
    moment: 'moment',
  },
  scripts: ['https://lib.baomitu.com/moment.js/latest/moment.min.js'],
});
