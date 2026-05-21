import { Typography } from 'antd';

import styles from './index.less';

const { Title, Paragraph } = Typography;

const WelcomePage: React.FC = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logoWrapper}>
            <img
              src={require('@/assets/logo.png')}
              alt="YEELEN LIGHTING Logo"
              className={styles.logo}
            />
          </div>
          <div className={styles.header}>
            <Title level={1} className={styles.title}>
              欢迎使用 YEELEN LIGHTING
            </Title>
            <Paragraph className={styles.subtitle}>
              现代化的内容管理系统
            </Paragraph>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;

