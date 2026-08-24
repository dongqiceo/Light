import { Typography } from 'antd';

import styles from './index.less';

const { Title } = Typography;

const WelcomePage: React.FC = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logoWrapper}>
            <img
              src={require('@/assets/logo.png')}
              alt="YEELEN LIGHTING CMS Logo"
              className={styles.logo}
            />
          </div>
          <div className={styles.header}>
            <Title level={1} className={styles.title}>
              WELCOME TO YEELEN LIGHTING CMS
            </Title>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;

