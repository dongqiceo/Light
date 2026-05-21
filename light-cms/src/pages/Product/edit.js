import React, { useState, useRef } from 'react';
import { Form, Modal, message, InputNumber, Select } from 'antd';

import { saveProduct, fetchProductDetail } from '@/services';
import LanguageTab from '@/components/LanguageTab';
import ImageUpload from '@/components/ImageUpload';

const { Item } = Form;

const Edit = ({ record, title, onSuccess, categoryOptions, languageList, children }) => {
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue, resetFields } = form;
  const languageTabRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const fields = [
    {
      name: 'name',
      label: '产品名称',
      placeholder: '请输入产品名称',
      rules: [{ required: true, message: '请输入产品名称' }],
    },
    {
      name: 'description',
      label: '描述',
      placeholder: '请输入描述',
      rules: [{ required: true, message: '请输入描述' }],
    },
    {
      name: 'colors',
      label: '颜色',
      rules: [{ required: true, message: '请选择颜色' }],
      render: () => (
        <Select
          mode="tags"
          allowClear
          placeholder="请输入颜色，回车添加"
          showSearch
        />
      ),
    },
    {
      name: 'sizes',
      label: '尺寸',
      rules: [{ required: true, message: '请选择尺寸' }],
      render: () => (
        <Select
          mode="tags"
          allowClear
          placeholder="请输入尺寸，回车添加"
          showSearch
        />
      ),
    },
    {
      name: 'powers',
      label: '功率',
      rules: [{ required: true, message: '请选择功率' }],
      render: () => (
        <Select
          mode="tags"
          allowClear
          placeholder="请输入功率，回车添加"
          showSearch
        />
      ),
    },
    {
      name: 'colorTemperatures',
      label: '色温',
      rules: [{ required: true, message: '请选择色温' }],
      render: () => (
        <Select
          mode="tags"
          allowClear
          placeholder="请输入色温，回车添加"
          showSearch
        />
      ),
    },
  ];

  const handleOpen = (flag) => {
    setOpen(!!flag);
    if (flag) {
      if (record?.id) {
        setLoading(true);
        setDetail(null);
        fetchProductDetail({ id: record.id })
          .then((res) => {
            if (res?.code === 100000 && res.data) {
              const d = res.data;
              const specs = d.specs || {};
              ['en', 'zh', 'ar'].forEach((code) => {
                if (!d[code]) d[code] = {};
                d[code].colors = specs.colors || [];
                d[code].sizes = specs.sizes || [];
                d[code].powers = specs.powers || [];
                d[code].colorTemperatures = specs.colorTemperatures || [];
              });
              setDetail(d);
              const images = d.images && Array.isArray(d.images)
                ? d.images.map((url) => (typeof url === 'string' ? url : url?.url)).filter(Boolean)
                : [];
              setFieldsValue({
                price: d.price,
                categoryId: d.categoryId,
                priority: d.priority,
                images,
              });
            }
          })
          .finally(() => setLoading(false));
      } else {
        setDetail(null);
        resetFields();
      }
    }
  };

  const handleSave = () => {
    const languageData = languageTabRef.current?.getData() || {};
    const langCodes = languageList?.map(l => l.code) || [];

    validateFields().then((values) => {
      const sharedKeys = Object.keys(values).filter(
        key => key !== 'images' && !langCodes.some(code => key.startsWith(`${code}_`))
      );
      const sharedFields = sharedKeys.reduce((acc, k) => ({ ...acc, [k]: values[k] }), {});
      const images = Array.isArray(values.images) ? values.images : [];
      const params = {
        ...sharedFields,
        ...languageData,
        images,
        id: record?.id,
      };
      setLoading(true);
      saveProduct(params).then((res) => {
        if (res?.code === 100000) {
          message.success('保存成功');
          handleOpen(false);
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
        open={open}
        forceRenders
        title={title}
        destroyOnHidden
        maskClosable={false}
        confirmLoading={loading}
        onOk={() => handleSave()}
        onCancel={() => handleOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Item
            label="分类"
            name="categoryId"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              allowClear
              placeholder="请选择分类"
              options={categoryOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Item>
          <LanguageTab
            ref={languageTabRef}
            form={form}
            languages={languageList}
            fields={fields}
            record={detail ?? record}
          />
          <Item
            label="图片"
            name="images"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <ImageUpload />
          </Item>
          <Item
            label="价格"
            name="price"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入价格"
            />
          </Item>
          <Item
            label="优先级"
            name="priority"
            rules={[{ required: true, message: '请输入优先级' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="请输入优先级"
            />
          </Item>
        </Form>
      </Modal>
    </>
  );
};

export default Edit;
