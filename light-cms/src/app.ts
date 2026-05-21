// 运行时配置

import { message } from 'antd';
import { request as requestHelper, history } from '@umijs/max';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState() {
  const token = localStorage.getItem('token');
  if (token) {
    // 实际项目中应该验证 token 是否有效
    return {
      token,
      user: {
        id: 0,
        name: 'Admin',
        nickName: 'Admin',
        gender: 'MALE',
      },
    };
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
        await requestHelper('/api/v1/logout');
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
  responseInterceptors: [
    (response) => {
      const { code, message: msg } = response.data;
      if (code !== 100000) {
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
