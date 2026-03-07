import { App } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PicbedUploadResult, picbedService } from '@/services/picbed';

const getFilesFromDataTransferItems = async (items: DataTransferItem[]): Promise<File[]> => {
  const files: File[] = [];
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file && file.type.startsWith('image/')) files.push(file);
    }
  }
  return files;
};

export const usePicbedUpload = (onSuccess?: () => void) => {
  const { t } = useTranslation('tools');
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<PicbedUploadResult[] | undefined> => {
      if (files.length === 0) return;
      setUploading(true);
      const results: PicbedUploadResult[] = [];
      try {
        for (const file of files) {
          const result = await picbedService.uploadImage(file);
          results.push(result);
        }
        const urls = results.map((r) => r.url).join('\n');
        await navigator.clipboard.writeText(urls);
        message.success(t('picbed.uploadSuccessCopied'));
        onSuccess?.();
        return results;
      } catch {
        message.error(t('picbed.uploadFailed'));
      } finally {
        setUploading(false);
      }
    },
    [message, onSuccess, t],
  );

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);
      const files = await getFilesFromDataTransferItems(items);
      if (files.length > 0) uploadFiles(files);
    },
    [uploadFiles],
  );

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!e.dataTransfer?.items) return;
      const items = Array.from(e.dataTransfer.items);
      const files = await getFilesFromDataTransferItems(items);
      uploadFiles(files);
    },
    [uploadFiles],
  );

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDragEnter = () => setIsDragging(true);
    const handleDragLeave = () => setIsDragging(false);

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handlePaste, handleDrop]);

  return { isDragging, uploadFiles, uploading };
};
