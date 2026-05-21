import React, { useState, useEffect } from 'react';
import { Form, Modal, message, InputNumber, Select } from 'antd';

import { saveFeatured, fetchProductListAll, fetchProductDetail } from '@/services';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

const { Item } = Form;

const Edit = ({ record, title, onSuccess, children }) => {
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue, resetFields } = form;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

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
        setSelectedImageUrl(record.image || '');
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
        setSelectedImageUrl('');
      }
    }
  };

  const handleProductChange = (productId) => {
    setFieldsValue({ image: undefined });
    setSelectedImageUrl('');
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
    });
  };

  const handleSelectImage = (url) => {
    setSelectedImageUrl(url);
    setFieldsValue({ image: url });
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
          {productImages.length > 0 && (
            <Item label="选择展示图" required>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {productImages.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectImage(url)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectImage(url)}
                    style={{
                      width: 80,
                      height: 80,
                      border: selectedImageUrl === url ? '3px solid #1890ff' : '1px solid #d9d9d9',
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <img src={resolveImageUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </Item>
          )}
          <Item name="image" hidden rules={[{ required: true, message: '请从上方选择一张展示图' }]}>
            <input type="hidden" />
          </Item>
          <Item name="priority" label="优先级" rules={[{ required: true, message: '请输入优先级' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入优先级" />
          </Item>
        </Form>
      </Modal>
    </>
  );
};

export default Edit;
