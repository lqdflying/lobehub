import { NextRequest, NextResponse } from 'next/server';

import { createLambdaContext } from '@/libs/trpc/lambda/context';
import { S3 } from '@/server/modules/S3';

const CONTENT_TYPE_MAP: Record<string, string> = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  svg: 'image/svg+xml',
  txt: 'text/plain',
  webp: 'image/webp',
};

export const GET = async (req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) => {
  // Require authenticated user — reuses all existing auth methods (OIDC, Clerk, NextAuth)
  const ctx = await createLambdaContext(req);
  if (!ctx.userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { key } = await params;
  const fileKey = key.join('/');

  try {
    const s3 = new S3();
    const bytes = await s3.getFileByteArray(fileKey);

    const ext = fileKey.split('.').pop()?.toLowerCase() ?? '';
    const contentType = CONTENT_TYPE_MAP[ext] ?? 'application/octet-stream';

    return new Response(bytes, {
      headers: {
        'Cache-Control': 'private, max-age=3600',
        'Content-Type': contentType,
      },
    });
  } catch (e) {
    console.error('[file-proxy] error fetching key:', fileKey, e);
    return new NextResponse('File not found', { status: 404 });
  }
};
