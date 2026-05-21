import React from 'react';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export const getColumns = () => [
  {
    width: 80,
    title: '序号',
    align: 'center',
    fixed: 'left',
    render: (text, value, index) => index + 1,
  },
  {
    title: '产品',
    dataIndex: 'productName',
    align: 'center',
    ellipsis: true,
    width: 180,
  },
  {
    title: '描述',
    dataIndex: 'desc',
    align: 'center',
    ellipsis: true,
    width: 200,
  },
  {
    title: '展示图',
    dataIndex: 'image',
    align: 'center',
    width: 100,
    render: (val) => (val ? <img src={resolveImageUrl(val)} alt="展示" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4 }} /> : '-'),
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    align: 'center',
    width: 90,
    sorter: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    align: 'center',
    width: 160,
    render: (val) => val && new Date(val).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
  },
];

export const Columns = getColumns();
