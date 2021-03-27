import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useLocation, useHistory } from 'react-router';

import { ConfigProvider, Layout } from 'antd';

import { FormOutlined, SyncOutlined } from '@ant-design/icons';

const { Content, Footer } = Layout;

import zhCN from 'antd/es/locale/zh_CN';
import theme from '@/theme';
import styled from 'styled-components';
import styles from './index.less';

const queyClient = new QueryClient();

interface MenuItemProps {
  active: boolean;
}
const MenuItem = styled.div<MenuItemProps>`
  .anticon {
    font-size: 28px;
  }
  font-size: 12px;
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: ${(props: Record<string, any>) => (props.active ? 1 : 0.9)};
  color: ${(props: Record<string, any>) =>
    props.active ? theme['primary-color'] : '#000'};
  cursor: pointer;
  :hover {
    color: ${theme['primary-color']};
    opacity: 1;
  }
  :active {
    opacity: 0.5;
  }
`;

const menu = [
  {
    title: '待办',
    path: '/task/',
    icon: <FormOutlined />,
  },
  { title: '历史', path: '/history/', icon: <SyncOutlined /> },
];

export default (props: PropsWithChildren<any>) => {
  const { pathname } = useLocation();
  const history = useHistory();

  function onMenuClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const path: string = e?.currentTarget?.dataset?.path as string;

    history.push({
      pathname: path,
    });
  }
  return (
    <QueryClientProvider client={queyClient}>
      <ConfigProvider locale={zhCN}>
        <Layout style={{ minHeight: '100%', height: '100%' }}>
          <Content
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            {props.children}
          </Content>
          <Footer className={styles['footer-menu']}>
            {menu.map((i) => (
              <MenuItem
                key={i.path}
                data-path={i.path}
                active={i.path.includes(pathname)}
                onClick={onMenuClick}
              >
                {i.icon}
                {i.title}
              </MenuItem>
            ))}
          </Footer>
        </Layout>
      </ConfigProvider>
    </QueryClientProvider>
  );
};
