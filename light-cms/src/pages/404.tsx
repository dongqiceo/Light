import { history } from '@umijs/max';
import { Button, Result, Space } from 'antd';

const NotFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="抱歉，您访问的页面不存在或已被移动。"
    extra={
      <Space wrap>
        <Button type="primary" onClick={() => history.push('/welcome')}>
          返回首页
        </Button>
        <Button onClick={() => window.history.back()}>返回上一页</Button>
      </Space>
    }
  />
);

export default NotFoundPage;
