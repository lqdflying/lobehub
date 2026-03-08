import {
  AGENT_RUNTIME_ERROR_SET,
  ChatCompletionErrorPayload,
  ModelRuntime,
} from '@lobechat/model-runtime';
import { ChatErrorType } from '@lobechat/types';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { getServerDB } from '@/database/core/db-adaptor';
import { createTraceOptions, initModelRuntimeWithUserPayload } from '@/server/modules/ModelRuntime';
import { FileService } from '@/server/services/file';
import { ChatStreamPayload } from '@/types/openai/chat';
import { createErrorResponse } from '@/utils/errorResponse';
import { getTracePayload } from '@/utils/trace';

const WEBAPI_FILES_PREFIX = '/webapi/files/';

/**
 * Translate /webapi/files/<key> proxy URLs in image_url content parts to real
 * S3 public URLs (via S3_PUBLIC_DOMAIN or presigned URL). The proxy endpoint
 * requires auth, so external AI providers (OpenAI, Anthropic server-side fetch)
 * cannot access those URLs directly.
 */
const resolveImageUrls = async (
  data: ChatStreamPayload,
  fileService: FileService,
): Promise<ChatStreamPayload> => {
  const messages = await Promise.all(
    data.messages.map(async (message) => {
      if (!Array.isArray(message.content)) return message;

      const content = await Promise.all(
        (message.content as any[]).map(async (part) => {
          const url: string | undefined = part?.image_url?.url;
          if (part?.type === 'image_url' && url?.includes(WEBAPI_FILES_PREFIX)) {
            const key = url.slice(url.indexOf(WEBAPI_FILES_PREFIX) + WEBAPI_FILES_PREFIX.length);
            return {
              ...part,
              image_url: { ...part.image_url, url: await fileService.getFullFileUrl(key) },
            };
          }
          return part;
        }),
      );

      return { ...message, content };
    }),
  );

  return { ...data, messages };
};

export const maxDuration = 300;

export const POST = checkAuth(async (req: Request, { params, jwtPayload, createRuntime }) => {
  const { provider } = await params;

  try {
    // ============  1. init chat model   ============ //
    let modelRuntime: ModelRuntime;
    if (createRuntime) {
      modelRuntime = createRuntime(jwtPayload);
    } else {
      modelRuntime = await initModelRuntimeWithUserPayload(provider, jwtPayload);
    }

    // ============  2. create chat completion   ============ //

    let data = (await req.json()) as ChatStreamPayload;

    // Translate /webapi/files/ proxy URLs to real S3 public URLs so that
    // external AI providers can fetch images directly.
    if (jwtPayload.userId) {
      const serverDB = await getServerDB();
      const fileService = new FileService(serverDB, jwtPayload.userId);
      data = await resolveImageUrls(data, fileService);
    }

    const tracePayload = getTracePayload(req);

    let traceOptions = {};
    // If user enable trace
    if (tracePayload?.enabled) {
      traceOptions = createTraceOptions(data, { provider, trace: tracePayload });
    }

    return await modelRuntime.chat(data, {
      user: jwtPayload.userId,
      ...traceOptions,
      signal: req.signal,
    });
  } catch (e) {
    const {
      errorType = ChatErrorType.InternalServerError,
      error: errorContent,
      ...res
    } = e as ChatCompletionErrorPayload;

    const error = errorContent || e;

    const logMethod = AGENT_RUNTIME_ERROR_SET.has(errorType as string) ? 'warn' : 'error';
    // track the error at server side
    console[logMethod](`Route: [${provider}] ${errorType}:`, error);

    return createErrorResponse(errorType, { error, ...res, provider });
  }
});
