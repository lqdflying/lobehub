import { lambdaClient } from '@/libs/trpc/client';
import { uploadService } from '@/services/upload';

export interface PicbedUploadResult {
  fileType: string;
  id: string;
  name: string;
  size: number;
  url: string;
}

class PicbedService {
  uploadImage = async (file: File): Promise<PicbedUploadResult> => {
    const { data: metadata, success } = await uploadService.uploadFileToS3(file, {
      skipCheckFileType: true,
    });

    if (!success) throw new Error('Upload failed');

    // Store the S3 key path; the tRPC router resolves it to a full public URL
    const record = await lambdaClient.picbed.create.mutate({
      fileType: file.type,
      name: file.name,
      size: file.size,
      url: metadata.path,
    });

    return {
      fileType: record.fileType,
      id: record.id,
      name: record.name,
      size: record.size,
      url: record.url, // full public URL resolved server-side
    };
  };

  list = async () => {
    return lambdaClient.picbed.list.query();
  };

  delete = async (id: string) => {
    return lambdaClient.picbed.delete.mutate({ id });
  };
}

export const picbedService = new PicbedService();
