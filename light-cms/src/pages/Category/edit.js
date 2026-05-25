import React, { useState, useRef } from 'react';
import { Form, Modal, message, InputNumber } from 'antd';

import { saveCategory } from '@/services';
import LanguageTab from '@/components/LanguageTab';

const { Item } = Form;

const Edit = ({ record, title, view, copy, onSuccess, languageList, children }) => {
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue, resetFields } = form;
  const languageTabRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fields = [
    {
      name: 'name',
      label: '分类名称',
      placeholder: '请输入分类名称',
      rules: [{ required: true, message: '请输入分类名称' }],
    },
  ];

  const handleOpen = (flag) => {
    setOpen(!!flag);
    if (flag && record) {
      const values = { ...record };
      setFieldsValue({
        priority: values.priority,
      });
    } else if (flag) {
      resetFields();
      setFieldsValue({ priority: 1 });
    }
  };

  const handleSave = () => {
    const languageData = languageTabRef.current?.getData() || {};
    const langCodes = languageList?.map(l => l.code) || [];

    validateFields().then((values) => {
      const sharedKeys = Object.keys(values).filter(
        key => !langCodes.some(code => key === `${code}_name` || key.startsWith(`${code}_`))
      );
      const sharedFields = sharedKeys.reduce((acc, k) => ({ ...acc, [k]: values[k] }), {});
      
      // 用英语内容自动填充其他语言缺失字段
      const filledLanguageData = { ...languageData };
      const enData = filledLanguageData['en'] || {};
      langCodes.forEach(code => {
        if (code !== 'en' && enData) {
          if (!filledLanguageData[code]) {
            filledLanguageData[code] = {};
          }
          // 对每个字段，如果缺失则用英语填充
          fields?.forEach(field => {
            if (!filledLanguageData[code][field.name] && enData[field.name]) {
              filledLanguageData[code][field.name] = enData[field.name];
            }
          });
        }
      });
      
      const params = {
        ...sharedFields,
        ...filledLanguageData,
        id: copy ? undefined : record?.id,
      };
      setLoading(true);
      saveCategory(params).then((res) => {
        if (res?.code === 100000) {
          message.success('保存成功');
          handleOpen(false);
          onSuccess?.();
        }
      }).finally(() => setLoading(false));
    });
  };

  return (<>
    {React.cloneElement(children, {
      onClick: () => handleOpen(true)
    })}
    <Modal
      open={open}
      width={600}
      forceRenders
      title={title}
      destroyOnHidden
      maskClosable={false}
      confirmLoading={loading}
      footer={view ? null : undefined}
      onCancel={() => handleOpen(false)}
      onOk={view ? undefined : () => handleSave()}
    >
      <Form form={form} layout="vertical">
        <LanguageTab
          ref={languageTabRef}
          form={form}
          languages={languageList}
          fields={fields}
          record={record}
        />
        <Item label="优先级" name="priority" rules={[{ required: true, message: '请输入优先级' }]}>
          <InputNumber min={1} style={{ width: '100%' }} disabled={!!view} />
        </Item>
      </Form>
    </Modal>
  </>);
};

export default Edit;
