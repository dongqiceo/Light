import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { fetchSettings, saveSettings, fetchLanguageListAll } from '@/services';
import LanguageTab from '@/components/LanguageTab';
import { notifyFormValidateError } from '@/utils/notifyFormValidateError';

const { Item } = Form;
const { TextArea } = Input;

const ABOUT_FIELDS = [
  {
    name: 'tagline',
    label: '标语',
    placeholder: '如：专注磁吸照明',
    rules: [],
  },
  {
    name: 'intro',
    label: '公司简介',
    placeholder: '如：YEELEN LIGHTING 专注于 LED 照明设计…',
    rules: [],
    render: () => <TextArea rows={3} placeholder="请输入公司简介" />,
  },
];

const SOCIAL_FIELDS = [
  { name: 'facebook', label: 'Facebook 链接', placeholder: 'https://facebook.com/...' },
  { name: 'tiktok', label: 'TikTok 链接', placeholder: 'https://tiktok.com/@...' },
  { name: 'whatsapp', label: 'WhatsApp 链接', placeholder: 'https://wa.me/...' },
  { name: 'instagram', label: 'Instagram 链接', placeholder: 'https://instagram.com/...' },
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
            ...SOCIAL_FIELDS.reduce((values, field) => ({ ...values, [field.name]: res.data?.[field.name] }), {}),
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
        ...SOCIAL_FIELDS.reduce((social, field) => ({ ...social, [field.name]: values[field.name] }), {}),
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
    }).catch((error) => {
      languageTabRef.current?.focusFirstError?.(error?.errorFields);
      notifyFormValidateError(error);
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
          rules={[]}
        >
          <TextArea rows={2} allowClear placeholder="公司地址（留空则不修改）" />
        </Item>

        <Item
          label="邮箱"
          name="contactEmail"
          rules={[
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input allowClear placeholder="邮箱（留空则不修改）" />
        </Item>

        <Item
          label="电话"
          name="contactPhone"
          rules={[]}
        >
          <Input allowClear placeholder="电话（留空则不修改）" />
        </Item>

        {SOCIAL_FIELDS.map((field) => (
          <Item key={field.name} label={field.label} name={field.name} rules={[{ type: 'url', message: '请输入有效链接' }]}>
            <Input allowClear placeholder={`${field.placeholder}（留空则不修改）`} />
          </Item>
        ))}

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
