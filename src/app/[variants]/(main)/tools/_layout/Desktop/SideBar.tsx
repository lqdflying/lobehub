'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PanelTitle from '@/components/PanelTitle';

import Nav from './Nav';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding-block: 0 16px;
    padding-inline: 12px;
    border-inline-end: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgLayout};
  `,
}));

const SideBar = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('tools');

  return (
    <Flexbox className={styles.container} flex={'none'} gap={20} width={220}>
      <PanelTitle title={t('title')} />
      <Flexbox flex={1}>
        <Nav />
      </Flexbox>
    </Flexbox>
  );
});

SideBar.displayName = 'ToolsSideBar';

export default SideBar;
