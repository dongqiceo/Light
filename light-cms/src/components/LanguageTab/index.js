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

  // 根据语言代码判断是否必选（英语必选，其他可选）
  const isRequiredLanguage = (langCode) => langCode === 'en';

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
      const enData = {};

      // 第一遍：收集英语数据
      fields?.forEach(field => {
        const fieldName = `en_${field.name}`;
        if (values[fieldName]) {
          enData[field.name] = values[fieldName];
        }
      });

      // 第二遍：遍历所有语言，缺失字段用英语填充
      languages?.forEach(lang => {
        const langData = {};
        fields?.forEach(field => {
          const fieldName = `${lang.code}_${field.name}`;
          // 使用填充的值，如果该字段为空则用英语内容
          const value = values[fieldName] !== undefined ? values[fieldName] : (lang.code !== 'en' ? enData[field.name] : undefined);
          if (value) {
            langData[field.name] = value;
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
    return fields?.map(field => {
      // 根据语言调整规则：英语必选，其他可选
      const isRequired = isRequiredLanguage(langCode);
      const adjustedRules = field.rules?.map(rule => {
        if (rule.required !== undefined) {
          return { ...rule, required: isRequired };
        }
        return rule;
      }) || [];

      return (
        <Item
          key={`${langCode}_${field.name}`}
          label={field.label}
          name={`${langCode}_${field.name}`}
          rules={adjustedRules}
          valuePropName={field.valuePropName}
        >
          {field.render ? field.render(langCode, form) : (
            <Input placeholder={field.placeholder || `请输入${field.label}`} />
          )}
        </Item>
      );
    }) || null;
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
