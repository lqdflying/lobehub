'use client';

import { useTheme } from 'antd-style';
import { Flexbox } from 'react-layout-kit';

import { LayoutProps } from '../type';
import Container from './Container';
import SideBar from './SideBar';

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();

  return (
    <Flexbox
      height={'100%'}
      horizontal
      style={{ background: theme.colorBgContainer, maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
      width={'100%'}
    >
      <SideBar />
      <Container>{children}</Container>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopToolsLayout';

export default Layout;
