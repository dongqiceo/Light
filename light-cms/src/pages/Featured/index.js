import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Button, Card, Divider, Table, Modal, message } from 'antd';

import Edit from './edit';
import { getColumns } from './options';
import { fetchFeaturedList, deleteFeatured } from '@/services';

const Index = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState({ field: 'updateTime', order: 'descend' });

  const fetchData = (pageOrPagination, nextSorter) => {
    if (nextSorter !== undefined) {
      setSorter(nextSorter?.field ? nextSorter : { field: 'updateTime', order: 'descend' });
    }
    const sort = nextSorter !== undefined ? (nextSorter?.field ? nextSorter : { field: 'updateTime', order: 'descend' }) : sorter;
    const params = {
      page: pageOrPagination?.current ?? pagination.current,
      pageSize: pageOrPagination?.pageSize ?? pagination.pageSize,
      sortField: sort?.field,
      sortOrder: sort?.order,
    };
    setLoading(true);
    fetchFeaturedList(params).then((res) => {
      if (res?.code === 100000) {
        setPagination({
          current: res.data?.page ?? 1,
          pageSize: res.data?.pageSize ?? 10,
          total: res.data?.total ?? 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 项`,
        });
        setList(res.data?.content ?? []);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (record) => {
    Modal.confirm({
      title: '删除',
      content: '确定删除该精选项吗？',
      onOk: () => {
        setLoading(true);
        deleteFeatured({ id: record?.id }).then((res) => {
          if (res.code === 100000) {
            fetchData();
            message.success('操作成功');
          }
        }).finally(() => setLoading(false));
      },
    });
  };

  const columns = getColumns().map((col) =>
    col.sorter ? { ...col, sortOrder: col.dataIndex === sorter?.field ? sorter.order : null } : col
  );

  return (
    <>
      <Card>
        <Edit title="新建" onSuccess={fetchData}>
          <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 10 }}>
            新建
          </Button>
        </Edit>

        <Table
          rowKey="id"
          size="middle"
          loading={loading}
          dataSource={list}
          onChange={(pagination, filters, sort) => {
            fetchData(pagination, sort?.field ? sort : { field: 'updateTime', order: 'descend' });
          }}
          pagination={pagination}
          scroll={{ x: 'max-content' }}
          columns={[
            ...columns,
            {
              title: '操作',
              fixed: 'right',
              align: 'center',
              width: 160,
              render: (text, record) => (
                <>
                  <Edit title="编辑" record={record} onSuccess={fetchData}>
                    <a>编辑</a>
                  </Edit>
                  <Divider type="vertical" />
                  <a onClick={() => handleDelete(record)} style={{ color: '#ff4d4f' }}>删除</a>
                </>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
};

export default Index;
