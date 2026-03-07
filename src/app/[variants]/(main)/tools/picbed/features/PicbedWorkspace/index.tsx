'use client';

import { Icon } from '@lobehub/ui';
import { App, Empty, Spin, Typography, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { ImageUp } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { picbedService } from '@/services/picbed';

import ImageCard from './ImageCard';
import { usePicbedUpload } from './usePicbedUpload';

const useStyles = createStyles(({ css, token }) => ({
  dropZone: css`
    border: 2px dashed ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;

    &:hover,
    &.dragging {
      border-color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
    }
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  `,
  title: css`
    margin-bottom: 0 !important;
  `,
}));

interface ImageRecord {
  createdAt: Date;
  fileType: string;
  id: string;
  name: string;
  size: number;
  url: string;
}

const PicbedWorkspace = memo(() => {
  const { styles, cx } = useStyles();
  const { t } = useTranslation('tools');
  const { message } = App.useApp();
  const { isDragging, uploadFiles, uploading } = usePicbedUpload();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadImages = useCallback(async () => {
    try {
      const list = await picbedService.list();
      setImages(list as ImageRecord[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleUpload = async (files: File[]) => {
    const results = await uploadFiles(files);
    if (results) loadImages();
  };

  const handleDelete = async (id: string) => {
    await picbedService.delete(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
    message.success(t('picbed.delete'));
  };

  const handleFileSelect = (file: File) => {
    handleUpload([file]);
    return false;
  };

  return (
    <Flexbox gap={24}>
      <Typography.Title className={styles.title} level={4}>
        {t('picbed.title')}
      </Typography.Title>

      <Upload.Dragger
        accept={'image/*'}
        beforeUpload={handleFileSelect}
        className={cx(styles.dropZone, isDragging && 'dragging')}
        showUploadList={false}
      >
        <Spin spinning={uploading}>
          <Flexbox align={'center'} gap={8}>
            <Icon icon={ImageUp} size={32} />
            <Typography.Text type={'secondary'}>{t('picbed.upload')}</Typography.Text>
            <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
              {t('picbed.dragTip')}
            </Typography.Text>
          </Flexbox>
        </Spin>
      </Upload.Dragger>

      {loading ? (
        <Flexbox align={'center'} justify={'center'} padding={40}>
          <Spin />
        </Flexbox>
      ) : images.length === 0 ? (
        <Empty description={t('picbed.empty')} />
      ) : (
        <div className={styles.grid}>
          {images.map((img) => (
            <ImageCard
              id={img.id}
              key={img.id}
              name={img.name}
              onDelete={handleDelete}
              url={img.url}
            />
          ))}
        </div>
      )}
    </Flexbox>
  );
});

export default PicbedWorkspace;
