export default [
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
];
