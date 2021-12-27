import { defineConfig } from 'umi';
import base from './src/js-sdk/configs/.umirc.default';
import routes from './routes';

export default defineConfig({
  ...base,
  title: '待办清单',
  routes,
  devServer: {
    port: 8041,
    proxy: {
      '/api/todo-list': {
        target: 'http://localhost:8040',
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
