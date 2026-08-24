import { defineConfig } from '@umijs/max';
import { codeInspectorPlugin } from 'code-inspector-plugin';

export default defineConfig({
  define: {
    'process.env.STATIC_BASE': 'http://localhost:3001',
  },
  chainWebpack(config, { env }) {
    if (env === 'development') {
      config.plugin('code-inspector-plugin').use(codeInspectorPlugin, [
        { bundler: 'webpack' },
      ]);
    }
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'YELLEN LIGHTING',
  },
  favicons: ['/logo.png'],
  mock: false,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
    '/light-cms': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
    '/无主灯清晰图片': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
  routes: [
    {
      path: '/',
      redirect: '/welcome',
    },
    {
      name: '登录',
      path: '/login',
      hideInMenu: true,
      component: './Login',
      access: 'canAccessLogin',
      layout: false,
    },
    {
      name: '欢迎页',
      path: '/welcome',
      hideInMenu: true,
      icon: 'icon-welcome',
      component: './Welcome',
    },
    {
      name: '语言管理',
      path: '/language',
      icon: 'GlobalOutlined',
      component: './Language',
    },
    {
      name: '分类管理',
      path: '/category',
      icon: 'AppstoreOutlined',
      component: './Category',
    },
    {
      name: '产品管理',
      path: '/product',
      icon: 'BulbOutlined',
      component: './Product',
    },
    {
      name: '精选产品',
      path: '/featured',
      icon: 'StarOutlined',
      component: './Featured',
    },
    {
      name: '关于我们',
      path: '/settings',
      icon: 'TeamOutlined',
      component: './Settings',
    },
    {
      name: '联系留言',
      path: '/contact-message',
      icon: 'MailOutlined',
      component: './ContactMessage',
    },
    {
      path: '*',
      hideInMenu: true,
      component: './404',
    },
  ],

  npmClient: 'pnpm',
});
