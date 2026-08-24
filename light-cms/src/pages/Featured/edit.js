import React, { useState, useEffect } from 'react';
import { Form, Modal, message, InputNumber, Select } from 'antd';

import { saveFeatured, fetchProductListAll, fetchProductDetail } from '@/services';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import { notifyFormValidateError } from '@/utils/notifyFormValidateError';

const { Item } = Form;

const ImagePicker = ({ id, images = [], value, onChange }) => (
  <div
    id={id}
    role="group"
    aria-label="选择展示图"
    style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
  >
    {images.map((url, index) => (
      <button
        type="button"
        key={`${url}-${index}`}
        aria-label={`选择展示图 ${index + 1}`}
        aria-pressed={value === url}
        onClick={() => onChange?.(url)}
        style={{
          display: 'block',
          width: 80,
          height: 80,
          padding: 0,
          background: 'transparent',
          border: value === url ? '3px solid #1890ff' : '1px solid #d9d9d9',
          borderRadius: 8,
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <img
          src={resolveImageUrl(url)}
          alt={`展示图 ${index + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </button>
    ))}
  </div>
);

const Edit = ({ record, title, onSuccess, children }) => {
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue, resetFields } = form;
  const selectedProductId = Form.useWatch('productId', form);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    fetchProductListAll().then((res) => {
      if (res?.code === 100000 && Array.isArray(res.data)) {
        setProductOptions(res.data.map((p) => ({ label: p.name || `产品 #${p.id}`, value: p.id })));
      }
    });
  }, []);

  const handleOpen = (flag) => {
    setOpen(!!flag);
    if (flag) {
      if (record) {
        setFieldsValue({
          productId: record.productId,
          image: record.image,
          priority: record.priority ?? 1,
        });
        if (record.productId) {
          fetchProductDetail({ id: record.productId }).then((res) => {
            if (res?.code === 100000 && res.data?.images) setProductImages(res.data.images || []);
            else setProductImages([]);
          });
        } else {
          setProductImages([]);
        }
      } else {
        resetFields();
        setProductImages([]);
      }
    }
  };

  const handleProductChange = (productId) => {
    setFieldsValue({ image: undefined });
    setProductImages([]);
    if (!productId) return;
    fetchProductDetail({ id: productId }).then((res) => {
      if (res?.code === 100000 && res.data?.images) setProductImages(res.data.images || []);
      else setProductImages([]);
    });
  };

  const handleSave = () => {
    validateFields().then((values) => {
      const params = { ...values, id: record?.id };
      setLoading(true);
      saveFeatured(params).then((res) => {
        if (res?.code === 100000) {
          message.success('保存成功');
          handleOpen(false);
          onSuccess?.();
        }
      }).finally(() => setLoading(false));
    }).catch(notifyFormValidateError);
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => handleOpen(true),
      })}
      <Modal
        open={open}
        forceRenders
        title={title}
        destroyOnClose
        maskClosable={false}
        confirmLoading={loading}
        onOk={handleSave}
        onCancel={() => handleOpen(false)}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Item name="productId" label="产品" rules={[{ required: true, message: '请选择产品' }]}>
            <Select
              allowClear
              placeholder="请选择产品"
              options={productOptions}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              onChange={handleProductChange}
            />
          </Item>
          {selectedProductId !== undefined && selectedProductId !== null && (
            <Item
              label="选择展示图"
              name="image"
              rules={[{ required: true, message: '请从上方选择一张展示图' }]}
            >
              <ImagePicker images={productImages} />
            </Item>
          )}
          <Item name="priority" label="优先级" rules={[{ required: true, message: '请输入优先级' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入优先级" />
          </Item>
        </Form>
      </Modal>
    </>
  );
};

export default Edit;
