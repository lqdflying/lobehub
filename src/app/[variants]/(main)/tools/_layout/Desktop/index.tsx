import { Flexbox } from 'react-layout-kit';

import { LayoutProps } from '../type';
import Container from './Container';

const Layout = ({ children }: LayoutProps) => {
  return (
    <Flexbox
      height={'100%'}
      horizontal
      style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
      width={'100%'}
    >
      <Container>{children}</Container>
    </Flexbox>
  );
};

Layout.displayName = 'DesktopToolsLayout';

export default Layout;
