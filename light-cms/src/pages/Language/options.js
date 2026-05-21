import { Tag } from 'antd';
import moment from 'moment';

import ColumnsTooltip from '@/components/ColumnsTooltip';

export const Columns = [
  {
    title: '语言名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
    ellipsis: true,
    render: ColumnsTooltip
  },
  {
    title: '语言代码',
    dataIndex: 'code',
    key: 'code',
    align: 'center',
  },
  {
    title: '是否默认',
    dataIndex: 'isDefault',
    key: 'isDefault',
    align: 'center',
    render: (text) => (text ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>),
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    align: 'center',
    render: (val) => {
      return val && moment(val).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];
