// 运行时配置

import { message } from 'antd';
import { request as requestHelper, history } from '@umijs/max';

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
  responseInterceptors: [
    (response) => {
      const { code, message: msg } = response.data;
      const url = response.config?.url || '';
      const isLoginRequest = url.includes('/api/v1/login');

      if (code === 401 && !isLoginRequest) {
        // token 过期或无效（登录失败由登录页展示后端 message）
        localStorage.removeItem('token');
        history.replace('/login');
        message.error(msg || '登录已过期，请重新登录');
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
  
  if (!token && !isLoginPage) {
    history.replace('/login');
  } else if (token && isLoginPage) {
    history.replace('/welcome');
  }
}
