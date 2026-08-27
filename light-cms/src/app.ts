// 运行时配置

import React from 'react';
import { message } from 'antd';
import { request as requestHelper, history } from '@umijs/max';
import UserMenu from '@/components/UserMenu';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // 从后端验证并获取用户信息
      const response = await requestHelper('/api/v1/user/current', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.code === 100000 && response.data) {
        localStorage.setItem('mustChangePassword', String(response.data.mustChangePassword === true));
        return {
          token,
          user: response.data,
        };
      }
    } catch (error) {
      console.log('获取用户信息失败', error);
    }
    // token 无效，清除
    localStorage.removeItem('token');
  }
  return { token: null, user: null };
}

export const layout = () => {
  return {
    logo: require('@/assets/logo.png'),
    menu: {
      locale: false,
    },
    rightRender: (initialState: any, setInitialState: any, runtimeConfig: any) => React.createElement(UserMenu, {
      initialState,
      setInitialState,
      logout: runtimeConfig.logout,
    }),
    logout: async () => {
      try {
        const token = localStorage.getItem('token');
        await requestHelper('/api/v1/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        localStorage.removeItem('token');
        localStorage.removeItem('mustChangePassword');
        message.success('退出成功');
        history.replace('/login');
        return true;
      } catch (error) {
        message.error('退出失败');
        return false;
      }
    },
  };
};

function notifyUnauthorized(msg?: string) {
  localStorage.removeItem('token');
  message.error(msg || '登录已过期，请重新登录');
  history.replace('/login');
}

export const request = {
  requestInterceptors: [
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  ],
  // 后端 AuthInterceptor 会把 HTTP status 设为 401，axios 走错误分支，不会进 responseInterceptors
  errorConfig: {
    errorHandler(error: any) {
      const url = error?.config?.url || '';
      if (url.includes('/api/v1/login')) {
        return;
      }
      const status = error?.response?.status;
      const data = error?.response?.data;
      if (status === 401 || data?.code === 401) {
        notifyUnauthorized(data?.message);
        return;
      }
      message.error(data?.message || error?.message || '请求失败');
    },
  },
  responseInterceptors: [
    (response) => {
      const { code, message: msg } = response.data || {};
      const url = response.config?.url || '';
      const isLoginRequest = url.includes('/api/v1/login');

      if (code === 401 && !isLoginRequest) {
        notifyUnauthorized(msg);
      } else if (code !== 100000 && !isLoginRequest) {
        message.error(msg || '操作失败');
      }
      return response;
    },
  ],
};

export function onRouteChange({ matchedRoutes, location }: any) {
  const token = localStorage.getItem('token');
  const isLoginPage = location.pathname === '/login';
  const isPasswordSetupPage = location.pathname === '/password-setup';
  const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';
  
  if (!token && !isLoginPage) {
    history.replace('/login');
  } else if (token && isLoginPage) {
    history.replace(mustChangePassword ? '/password-setup' : '/welcome');
  } else if (token && mustChangePassword && !isPasswordSetupPage) {
    history.replace('/password-setup');
  }
}
