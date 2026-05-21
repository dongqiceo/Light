import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Tabs, Form, Input } from 'antd';

const { Item } = Form;

const LanguageTab = forwardRef(({ form, languages, fields, record }, ref) => {
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    if (languages && languages.length > 0) {
      const defaultLang = languages.find(lang => lang.isDefault) || languages[0];
      setActiveKey(defaultLang.code);
    }
  }, [languages]);

  useEffect(() => {
    if (record && languages) {
      const formData = {};
      languages.forEach(lang => {
        fields?.forEach(field => {
          const val = record[lang.code]?.[field.name];
          if (val === undefined) return;
          const key = `${lang.code}_${field.name}`;
          if (field.name === 'images' && Array.isArray(val)) {
            formData[key] = val.map((url) => (typeof url === 'string' ? url : url?.url)).filter(Boolean);
          } else {
            formData[key] = val;
          }
        });
      });
      form.setFieldsValue(formData);
    }
  }, [record, languages, fields, form]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      const values = form.getFieldsValue();
      const result = {};
      languages?.forEach(lang => {
        const langData = {};
        fields?.forEach(field => {
          const fieldName = `${lang.code}_${field.name}`;
          if (values[fieldName]) {
            langData[field.name] = values[fieldName];
          }
        });
        if (Object.keys(langData).length > 0) {
          result[lang.code] = langData;
        }
      });
      return result;
    },
  }));

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const renderFieldsForLang = (langCode) => {
    return fields?.map(field => (
      <Item
        key={`${langCode}_${field.name}`}
        label={field.label}
        name={`${langCode}_${field.name}`}
        rules={field.rules}
        valuePropName={field.valuePropName}
      >
        {field.render ? field.render(langCode, form) : (
          <Input placeholder={field.placeholder || `请输入${field.label}`} />
        )}
      </Item>
    )) || null;
  };

  const getLanguageTabs = () => {
    return languages?.map(lang => ({
      key: lang.code,
      label: lang.name,
      children: renderFieldsForLang(lang.code),
      forceRender: true,
    })) || [];
  };

  if (!languages || languages.length === 0) {
    return null;
  }

  return (
    <div className="language-tab-container">
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        destroyInactiveTabPane={false}
        items={getLanguageTabs()}
      />
    </div>
  );
});

LanguageTab.displayName = 'LanguageTab';

export default LanguageTab;
