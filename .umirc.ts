import { defineConfig } from 'umi';
import base from './.umirc.default';

export default defineConfig({
  ...base,
  title: '待办清单',
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
  devServer: {
    port: 80,
    proxy: {
      '/api/todo-list': {
        target: 'http://todo-list-go-dev',
        changeOrigin: true,
        pathRewrite: {
          '/api/todo-list': '',
        },
      },
    },
  },
  base: '/micro/todo-list',
  publicPath: '/micro/todo-list/',
  extraBabelPlugins: [
    [
      'babel-plugin-styled-components',
      {
        namespace: 'todo-list',
      },
    ],
  ],
});
