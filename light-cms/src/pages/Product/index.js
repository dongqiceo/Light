import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Button, Card, Divider, Form, Input, Modal, Table, message, Select } from 'antd';

import Edit from './edit';
import { Columns } from './options';
import { FilterItemAttr } from '@/utils/constant';
import { fetchProductList, deleteProduct, fetchCategoryListAll, fetchLanguageListAll } from '@/services';

const { Item } = Form;

const Index = () => {
  const [form] = Form.useForm();
  const { getFieldsValue } = form;

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formValue, setFormValue] = useState({});
  const [categoryListAll, setCategoryListAll] = useState([]);
  const [languageList, setLanguageList] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sorter, setSorter] = useState({ field: 'updateTime', order: 'descend' });

  useEffect(() => {
    fetchData();
    fetchCategoryListAll().then((res) => {
      if (res.code === 100000) {
        const options = (res.data || []).map(item => ({
          label: item.name,
          value: item.id,
        }));
        setCategoryListAll(options);
      }
    });
    fetchLanguageListAll().then((res) => {
      if (res.code === 100000) {
        setLanguageList(res.data || []);
      }
    });
  }, []);

  const fetchData = (pageOrPagination, nextSorter) => {
    let values = !pageOrPagination ? getFieldsValue() : formValue;
    if (!pageOrPagination) {
      setFormValue(getFieldsValue());
    }
    if (nextSorter !== undefined) {
      setSorter(nextSorter?.field ? nextSorter : { field: 'updateTime', order: 'descend' });
    }
    const sort = nextSorter !== undefined ? (nextSorter?.field ? nextSorter : { field: 'updateTime', order: 'descend' }) : sorter;
    const params = {
      ...values,
      page: pageOrPagination?.current ?? pagination.current,
      pageSize: pageOrPagination?.pageSize ?? pagination.pageSize,
      sortField: sort?.field,
      sortOrder: sort?.order,
    };

    setLoading(true);
    fetchProductList({ ...params }).then((res) => {
      console.log('Product list response:', res);
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
        console.log('Product list content:', content);
        setList(content);
      }
    }).finally(() => setLoading(false));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '删除',
      content: '确定删除吗？',
      onOk: () => {
        setLoading(true);
        deleteProduct({ id: record?.id }).then((res) => {
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
          <Item label="产品名称" name="name">
            <Input allowClear placeholder="请输入" {...FilterItemAttr} />
          </Item>
          <Item label="分类" name="categoryId">
            <Select allowClear placeholder="请选择" options={categoryListAll} {...FilterItemAttr} />
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
        <Edit title="新建" onSuccess={fetchData} categoryOptions={categoryListAll} languageList={languageList}>
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
            ...Columns.map((col) =>
              col.sorter ? { ...col, sortOrder: col.dataIndex === sorter?.field ? sorter.order : null } : col
            ),
            {
              title: '操作',
              fixed: 'right',
              align: 'center',
              render: (_, record) => {
                return (
                  <>
                    <Edit title="编辑" record={record} onSuccess={fetchData} categoryOptions={categoryListAll} languageList={languageList}>
                      <a>编辑</a>
                    </Edit>
                    <Divider type="vertical" />
                    <a onClick={() => handleDelete(record)} style={{ color: '#ff4d4f' }}>删除</a>
                  </>
                );
              },
            },
          ]}
        />
      </Card>
    </>
  );
};

export default Index;
