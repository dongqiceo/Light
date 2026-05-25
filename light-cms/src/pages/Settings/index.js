import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { fetchSettings, saveSettings, fetchLanguageListAll } from '@/services';
import LanguageTab from '@/components/LanguageTab';

const { Item } = Form;
const { TextArea } = Input;

const ABOUT_FIELDS = [
  {
    name: 'tagline',
    label: '标语',
    placeholder: '如：专注磁吸照明',
    rules: [{ required: true, message: '请输入标语' }],
  },
  {
    name: 'intro',
    label: '公司简介',
    placeholder: '如：YEELEN LIGHTING 专注于 LED 照明设计…',
    rules: [{ required: true, message: '请输入公司简介' }],
    render: () => <TextArea rows={3} placeholder="请输入公司简介" />,
  },
];

const Index = () => {
  const [form] = Form.useForm();
  const languageTabRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [languageList, setLanguageList] = useState([]);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    fetchLanguageListAll().then((res) => {
      if (res.code === 100000) {
        setLanguageList(res.data || []);
      }
    });
    fetchData();
  }, []);

  const fetchData = () => {
    setInitialLoading(true);
    fetchSettings()
      .then((res) => {
        if (res.code === 100000) {
          setRecord(res.data || {});
          form.setFieldsValue({
            contactEmail: res.data?.contactEmail,
            contactPhone: res.data?.contactPhone,
            address: res.data?.address,
          });
        }
      })
      .finally(() => setInitialLoading(false));
  };

  const handleSave = () => {
    const languageData = languageTabRef.current?.getData() || {};
    form.validateFields().then((values) => {
      // 用英语内容自动填充其他语言缺失字段
      const filledLanguageData = { ...languageData };
      const enData = filledLanguageData['en'] || {};
      const langCodes = languageList?.map(l => l.code) || [];
      
      langCodes.forEach(code => {
        if (code !== 'en' && enData) {
          if (!filledLanguageData[code]) {
            filledLanguageData[code] = {};
          }
          // 对每个字段，如果缺失则用英语填充
          ABOUT_FIELDS.forEach(field => {
            if (!filledLanguageData[code][field.name] && enData[field.name]) {
              filledLanguageData[code][field.name] = enData[field.name];
            }
          });
        }
      });
      
      const params = {
        ...filledLanguageData,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        address: values.address,
      };
      setLoading(true);
      saveSettings(params)
        .then((res) => {
          if (res.code === 100000) {
            message.success('保存成功');
            fetchData();
          }
        })
        .finally(() => setLoading(false));
    });
  };

  return (
    <Card loading={initialLoading} title="关于我们 · 联系信息">
      <Form form={form} layout="vertical" style={{ maxWidth: 800 }}>
        <LanguageTab
          ref={languageTabRef}
          form={form}
          languages={languageList}
          fields={ABOUT_FIELDS}
          record={record}
        />

        <Item
          label="地址"
          name="address"
          rules={[{ required: true, message: '请输入地址' }]}
        >
          <TextArea rows={2} allowClear placeholder="公司地址" />
        </Item>

        <Item
          label="邮箱"
          name="contactEmail"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input allowClear placeholder="yeelen_magnetic@outlook.com" />
        </Item>

        <Item
          label="电话"
          name="contactPhone"
          rules={[{ required: true, message: '请输入电话' }]}
        >
          <Input allowClear placeholder="+86-15270820556" />
        </Item>

        <Item>
          <Button type="primary" onClick={handleSave} loading={loading}>
            保存
          </Button>
        </Item>
      </Form>
    </Card>
  );
};

export default Index;
