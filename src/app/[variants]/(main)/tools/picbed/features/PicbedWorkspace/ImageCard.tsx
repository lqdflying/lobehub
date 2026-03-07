'use client';

import { ActionIcon } from '@lobehub/ui';
import { App, Input, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import { Check, Copy, Trash2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    overflow: hidden;
    background: ${token.colorBgContainer};
  `,
  footer: css`
    padding: 8px 12px;
    gap: 8px;
  `,
  image: css`
    width: 100%;
    height: 160px;
    object-fit: cover;
    display: block;
  `,
  urlInput: css`
    flex: 1;
    font-size: 12px;
  `,
}));

interface ImageCardProps {
  id: string;
  name: string;
  onDelete: (id: string) => void;
  url: string;
}

const ImageCard = memo<ImageCardProps>(({ id, name, url, onDelete }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('tools');
  const { message } = App.useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    message.success(t('picbed.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Flexbox className={styles.card}>
      <img alt={name} className={styles.image} src={url} />
      <Flexbox align={'center'} className={styles.footer} horizontal>
        <Input className={styles.urlInput} readOnly size={'small'} value={url} />
        <Tooltip title={t('picbed.copy')}>
          <ActionIcon
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            size={{ blockSize: 28, size: 14 }}
          />
        </Tooltip>
        <Tooltip title={t('picbed.delete')}>
          <ActionIcon
            icon={Trash2}
            onClick={() => onDelete(id)}
            size={{ blockSize: 28, size: 14 }}
          />
        </Tooltip>
      </Flexbox>
    </Flexbox>
  );
});

export default ImageCard;
