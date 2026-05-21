import moment from 'moment';

import { Image } from 'antd';
import ColumnsTooltip from '@/components/ColumnsTooltip';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export const Columns = [
  {
    title: '序号',
    align: 'center',
    fixed: 'left',
    render: (text, value, index) => {
      return index + 1;
    },
  },
  {
    title: '分类',
    dataIndex: 'categoryName',
    align: 'center',
  },
  {
    title: '产品名称',
    dataIndex: 'name',
    align: 'center',
    ellipsis: true,
    render: ColumnsTooltip
  },
  {
    title: '产品图片',
    dataIndex: 'images',
    align: 'center',
    render: (val) => {
      if (Array.isArray(val) && val.length > 0) {
        const src = resolveImageUrl(typeof val[0] === 'string' ? val[0] : val[0]?.url);
        const items = val.map((image) => resolveImageUrl(typeof image === 'string' ? image : image?.url));
        return (
          <Image.PreviewGroup items={items}>
            <Image src={src} alt="product" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} />
          </Image.PreviewGroup>
        );
      }
      return '-';
    },
  },
  {
    title: '描述',
    dataIndex: 'description',
    align: 'center',
    ellipsis: true,
    render: ColumnsTooltip
  },
  {
    title: '价格',
    dataIndex: 'price',
    align: 'center',
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
];
