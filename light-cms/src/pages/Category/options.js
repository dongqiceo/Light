import moment from 'moment';

import ColumnsTooltip from '@/components/ColumnsTooltip';

export const Columns = [
  {
    title: '序号',
    align: 'center',
    fixed: 'left',
    render: (_, record, index) => {
      return index + 1;
    },
  },
  {
    title: '分类名称',
    dataIndex: 'name',
    align: 'center',
    ellipsis: true,
    render: ColumnsTooltip
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    align: 'center',
    sorter: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
    render: (val) => {
      return val && moment(val).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    align: 'center',
    render: (val) => {
      return val && moment(val).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    title: '操作人',
    dataIndex: 'operatorId',
    align: 'center',
  },
];