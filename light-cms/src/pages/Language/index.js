import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Button, Card, Divider, Form, Input, Modal, Table, message } from 'antd';

import Edit from './edit';
import { Columns } from './options';
import { FilterItemAttr } from '@/utils/constant';
import { fetchLanguageList, deleteLanguage, saveLanguage } from '@/services';

const { Item } = Form;

const Index = () => {
  const [form] = Form.useForm();
  const { getFieldsValue } = form;

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formValue, setFormValue] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = (page) => {
    let values = !page ? getFieldsValue() : formValue;
    if (!page) {
      setFormValue(getFieldsValue());
    }

    const params = {
      ...values,
      page: page?.current || 1,
      pageSize: page?.pageSize || pagination.pageSize,
    };

    setLoading(true);
    fetchLanguageList({ ...params }).then((res) => {
      if (res.code === 100000) {
        setPagination({
          current: res.data?.page,
          pageSize: res.data?.pageSize,
          total: res.data?.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 项`,
        });
        const content = res?.data?.content || [];
        setList(content);
      }
    }).finally(() => setLoading(false));
  };

  const handleSetDefault = (record) => {
    saveLanguage({
      id: record.id,
      name: record.name,
      code: record.code,
      isDefault: true,
    }).then((res) => {
      if (res?.code === 100000) {
        message.success('已设为默认');
        fetchData();
      }
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '删除',
      content: '确定删除吗？',
      onOk: () => {
        setLoading(true);
        deleteLanguage({ id: record?.id }).then((res) => {
          if (res.code === 100000) {
            fetchData();
            message.success('操作成功');
          }
        }).finally(() => setLoading(false));
      },
    });
  };

  return (
    <>
      <Card style={{ marginBottom: 15 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={() => fetchData()}
          onReset={() => fetchData()}
        >
          <Item label="语言名称" name="name">
            <Input allowClear placeholder="请输入" {...FilterItemAttr} />
          </Item>
          <Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
              查询
            </Button>
            <Button htmlType="reset">重置</Button>
          </Item>
        </Form>
      </Card>

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
          onChange={fetchData}
          pagination={pagination}
          scroll={{ x: 'max-content' }}
          columns={[
            ...Columns,
            {
              title: '操作',
              fixed: 'right',
              align: 'center',
              render: (text, record) => (
                <span style={{ whiteSpace: 'nowrap' }}>
                  <Edit title="编辑" record={record} onSuccess={fetchData}>
                    <a>编辑</a>
                  </Edit>
                  {!record.isDefault && (
                    <>
                      <Divider type="vertical" />
                      <a onClick={() => handleSetDefault(record)}>设为默认</a>
                    </>
                  )}
                  <Divider type="vertical" />
                  <a onClick={() => handleDelete(record)} style={{ color: '#ff4d4f' }}>删除</a>
                </span>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
};

export default Index;
