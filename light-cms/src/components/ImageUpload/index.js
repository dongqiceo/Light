import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image } from 'antd';
import { PlusOutlined, HolderOutlined } from '@ant-design/icons';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

/**
 * 多图上传组件，支持多选、拖拽排序
 * @param {string[]|string} value - 当前图片地址列表（maxCount=1 时为 string）
 * @param {function(string[]|string)} onChange - 值变化回调（maxCount=1 时回传 string）
 * @param {string} uploadUrl - 上传接口地址
 * @param {number} maxCount - 最大数量，不传不限制；为 1 时与 Form name="image" 等单字段兼容
 */
const ImageUpload = ({ value, onChange, uploadUrl = '/light-cms/upload', maxCount }) => {
  const [draggingIndex, setDraggingIndex] = useState(null);

  const urls = Array.isArray(value)
    ? value
    : typeof value === 'string' && value
      ? [value]
      : [];

  const urlsRef = useRef(urls);
  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  const emit = (next) => {
    urlsRef.current = next;
    if (maxCount === 1) onChange?.(next?.[0] ?? '');
    else onChange?.(next);
  };

  const handleUpload = ({ file, onSuccess: onUploadSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    fetch(uploadUrl, { method: 'POST', body: formData })
      .then((res) => res.json())
      .then((data) => {
        const url = data.data?.url ?? data.url;
        if (data.code === 100000 && url) {
          const next = [...urlsRef.current, url];
          emit(next);
          onUploadSuccess({ url });
        } else {
          onError(new Error(data.message || '上传失败'));
        }
      })
      .catch(onError);
  };

  const handleRemove = (index) => {
    const next = urls.filter((_, i) => i !== index);
    emit(next);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    setDraggingIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData('text/plain'));
    setDraggingIndex(null);
    if (dragIndex === dropIndex || Number.isNaN(dragIndex)) return;
    const next = [...urls];
    const [item] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, item);
    emit(next);
  };

  const handleDragEnd = () => setDraggingIndex(null);

  const canAdd = maxCount === null || maxCount === undefined || urls.length < maxCount;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Image.PreviewGroup>
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            style={{
              width: 104,
              height: 104,
              border: '1px dashed #d9d9d9',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'grab',
              background: '#fafafa',
              overflow: 'hidden',
              opacity: draggingIndex === index ? 0.6 : 1,
            }}
          >
            <HolderOutlined style={{ position: 'absolute', left: 4, top: 4, color: '#999', cursor: 'grab', zIndex: 1 }} />
            <Image
              src={resolveImageUrl(url)}
              alt=""
              width={104}
              height={104}
              style={{ objectFit: 'cover', borderRadius: 8, cursor: 'pointer', display: 'block' }}
              rootClassName="image-upload-preview"
            />
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
              onKeyDown={(e) => e.key === 'Enter' && handleRemove(index)}
              style={{
                position: 'absolute',
                right: 4,
                top: 4,
                width: 22,
                height: 22,
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 12,
                zIndex: 2,
              }}
            >
              ×
            </span>
          </div>
        ))}
      </Image.PreviewGroup>
      {canAdd && (
        <Upload
          name="file"
          multiple
          listType="picture-card"
          showUploadList={false}
          customRequest={handleUpload}
          accept="image/*"
          style={{ margin: 0 }}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        </Upload>
      )}
    </div>
  );
};

export default ImageUpload;
