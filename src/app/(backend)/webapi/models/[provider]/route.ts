import { ChatCompletionErrorPayload } from '@lobechat/model-runtime';
import { ChatErrorType } from '@lobechat/types';
import { NextResponse } from 'next/server';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { initModelRuntimeWithUserPayload } from '@/server/modules/ModelRuntime';
import { createErrorResponse } from '@/utils/errorResponse';

export const GET = checkAuth(async (req, { params, jwtPayload }) => {
  const { provider } = await params;

  try {
    const agentRuntime = await initModelRuntimeWithUserPayload(provider, {
      ...jwtPayload,
    });

    const list = await agentRuntime.models();

    return NextResponse.json(list);
  } catch (e) {
    const {
      errorType = ChatErrorType.InternalServerError,
      error: errorContent,
      ...res
    } = e as ChatCompletionErrorPayload;

    const error = errorContent || e;
    // track the error at server side
    console.error(`Route: [${provider}] ${errorType}:`, error);

    return createErrorResponse(errorType, { error, ...res, provider });
  }
});
