import React, { useState } from 'react';
import { Form, Input, Switch, message, Modal } from 'antd';

import { saveLanguage } from '@/services';

const { Item } = Form;

const Edit = ({ children, title, record, onSuccess }) => {
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue } = form;

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = (flag) => {
    setVisible(!!flag);
    if (flag) {
      if (record) {
        setFieldsValue({
          name: record.name,
          code: record.code,
          isDefault: record.isDefault,
        });
      } else {
        setFieldsValue({
          name: '',
          code: '',
          isDefault: false,
        });
      }
    }
  };

  const handleOk = async () => {
    validateFields().then((values) => {
      setLoading(true);
      const params = {
        ...values,
        id: record?.id,
      };
      saveLanguage(params).then((res) => {
        if (res?.code === 100000) {
          message.success('操作成功');
          setVisible(false);
          onSuccess?.();
        }
      }).finally(() => setLoading(false));
    });
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => handleOpen(true)
      })}
      <Modal
        forceRenders
        title={title}
        destroyOnHidden
        maskClosable={false}
        open={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Item
            label="语言名称"
            name="name"
            rules={[{ required: true, message: '请输入语言名称' }]}
          >
            <Input placeholder="请输入语言名称，如：中文、English" />
          </Item>
          <Item
            label="语言代码"
            name="code"
            rules={[{ required: true, message: '请输入语言代码' }]}
          >
            <Input placeholder="请输入语言代码，如：zh、en" />
          </Item>
          <Item
            label="是否默认"
            name="isDefault"
            valuePropName="checked"
          >
            <Switch />
          </Item>
        </Form>
      </Modal>
    </>
  );
};

export default Edit;
