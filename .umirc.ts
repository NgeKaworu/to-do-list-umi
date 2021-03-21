import { defineConfig } from 'umi';
import theme from './src/theme';

export default defineConfig({
  title: '单词卡',
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
        { path: '/', redirect: '/record/' },
        { path: '/record/', component: 'record' },
        { path: '/review/', component: 'review' },
        // { redirect: '/record/' },
      ],
    },
  ],

  hash: true,
  base: '/flashcard',
  publicPath: '/flashcard/',
  runtimePublicPath: true,
  extraBabelPlugins: [
    [
      'babel-plugin-styled-components',
      {
        namespace: 'flashcard',
      },
    ],
  ],
  externals: {
    moment: 'moment',
  },
  scripts: ['https://lib.baomitu.com/moment.js/latest/moment.min.js'],
});
