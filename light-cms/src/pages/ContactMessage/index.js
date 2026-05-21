import React, { useEffect, useState } from 'react';
import { Card, Table, Modal, message, Descriptions, Divider } from 'antd';
import { getColumns } from './options';
import {
  fetchContactMessageList,
  fetchContactMessageDetail,
  deleteContactMessage,
} from '@/services';

const Index = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState({ field: 'created_at', order: 'descend' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = (pageOrPagination, nextSorter) => {
    if (nextSorter !== undefined) {
      setSorter(nextSorter?.field ? nextSorter : { field: 'created_at', order: 'descend' });
    }
    const sort =
      nextSorter !== undefined
        ? nextSorter?.field
          ? nextSorter
          : { field: 'created_at', order: 'descend' }
        : sorter;
    const params = {
      page: pageOrPagination?.current ?? pagination.current,
      pageSize: pageOrPagination?.pageSize ?? pagination.pageSize,
      sortField: sort?.field,
      sortOrder: sort?.order,
    };
    setLoading(true);
    fetchContactMessageList(params)
      .then((res) => {
        if (res?.code === 100000) {
          setPagination({
            current: res.data?.page ?? 1,
            pageSize: res.data?.pageSize ?? 10,
            total: res.data?.total ?? 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条留言`,
          });
          setList(res.data?.content ?? []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDetail = (record) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    fetchContactMessageDetail({ id: record.id })
      .then((res) => {
        if (res?.code === 100000) {
          setDetail(res.data);
        } else {
          message.error(res?.message || '加载失败');
          setDetailOpen(false);
        }
      })
      .finally(() => setDetailLoading(false));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '删除留言',
      content: `确定删除 ${record.name || ''} 的留言吗？`,
      okType: 'danger',
      onOk: () =>
        deleteContactMessage({ id: record.id }).then((res) => {
          if (res.code === 100000) {
            message.success('已删除');
            fetchData();
            if (detail?.id === record.id) {
              setDetailOpen(false);
            }
          }
        }),
    });
  };

  const columns = getColumns().map((col) =>
    col.sorter ? { ...col, sortOrder: col.dataIndex === sorter?.field ? sorter.order : null } : col,
  );

  return (
    <>
      <Card title="联系留言" extra="H5「联系我们」表单提交记录">
        <Table
          rowKey="id"
          size="middle"
          loading={loading}
          dataSource={list}
          onChange={(pag, filters, sort) => {
            fetchData(pag, sort?.field ? sort : { field: 'created_at', order: 'descend' });
          }}
          pagination={pagination}
          scroll={{ x: 'max-content' }}
          columns={[
            ...columns,
            {
              title: '操作',
              fixed: 'right',
              align: 'center',
              width: 140,
              render: (text, record) => (
                <>
                  <a onClick={() => openDetail(record)}>查看</a>
                  <Divider type="vertical" />
                  <a onClick={() => handleDelete(record)} style={{ color: '#ff4d4f' }}>
                    删除
                  </a>
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="留言详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        {detailLoading ? (
          <p>加载中…</p>
        ) : detail ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="姓名">{detail.name}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{detail.email}</Descriptions.Item>
            <Descriptions.Item label="国家">{detail.country || '—'}</Descriptions.Item>
            <Descriptions.Item label="电话">{detail.tel || '—'}</Descriptions.Item>
            <Descriptions.Item label="WhatsApp">{detail.whatsapp || '—'}</Descriptions.Item>
            <Descriptions.Item label="公司">{detail.company || '—'}</Descriptions.Item>
            <Descriptions.Item label="留言">
              <div style={{ whiteSpace: 'pre-wrap' }}>{detail.message}</div>
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">{detail.created_at}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </>
  );
};

export default Index;
