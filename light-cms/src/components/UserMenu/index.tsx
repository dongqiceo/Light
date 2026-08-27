import React, { useState } from 'react';
import { Avatar, Dropdown, Modal, Upload, message } from 'antd';
import type { MenuProps } from 'antd';
import { CameraOutlined, LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { history, request } from '@umijs/max';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

type UserMenuProps = {
  initialState: any;
  setInitialState: (state: any) => void;
  logout: () => Promise<void> | void;
};

const UserMenu: React.FC<UserMenuProps> = ({ initialState, setInitialState, logout }) => {
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const user = initialState?.user || {};
  const avatar = user.avatar || '';
  const displayName = user.nickName || user.name || user.username || '管理员';

  const updateAvatar = (url: string) => {
    setInitialState((current: any) => ({
      ...current,
      user: { ...current?.user, avatar: url },
    }));
    setAvatarModalOpen(false);
    message.success('头像修改成功');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      disabled: true,
      label: <strong>{displayName}</strong>,
      icon: <UserOutlined />,
    },
    { type: 'divider' },
    {
      key: 'avatar',
      label: '修改头像',
      icon: <CameraOutlined />,
      onClick: () => setAvatarModalOpen(true),
    },
    {
      key: 'password',
      label: '修改密码',
      icon: <LockOutlined />,
      onClick: () => history.push('/change-password'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <>
      <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
        <button type="button" className="cms-user-menu-trigger" aria-label="打开用户菜单">
          <Avatar size={48} src={avatar ? resolveImageUrl(avatar) : undefined} icon={<UserOutlined />} />
          <span className="cms-user-menu-name">{displayName}</span>
        </button>
      </Dropdown>
      <Modal
        title="修改头像"
        open={avatarModalOpen}
        footer={null}
        onCancel={() => setAvatarModalOpen(false)}
      >
        <Upload
          accept="image/*"
          maxCount={1}
          showUploadList={false}
          customRequest={async ({ file, onSuccess, onError }: any) => {
            const formData = new FormData();
            formData.append('file', file);
            try {
              const response = await request('/light-cms/user/avatar', { method: 'POST', data: formData });
              const url = response?.data?.url || response?.url;
              if (response?.code === 100000 && url) {
                updateAvatar(url);
                onSuccess?.({ url });
              } else {
                onError?.(new Error(response?.message || '头像上传失败'));
              }
            } catch (error) {
              onError?.(error);
            }
          }}
        >
          <div className="cms-avatar-upload">
            <Avatar size={96} src={avatar ? resolveImageUrl(avatar) : undefined} icon={<UserOutlined />} />
            <span>点击选择图片</span>
          </div>
        </Upload>
      </Modal>
    </>
  );
};

export default UserMenu;