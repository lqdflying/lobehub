# API Tester Tool Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a stateless REST API testing tool (like Postman) to the Tools Hub at `/tools/apitest`.

**Architecture:** Pure client-side React component — no database, no tRPC, no server calls. Follows the Password tool pattern. All state lives in React `useState`; state is lost on page refresh. Uses the browser `fetch()` API to make HTTP requests directly.

**Tech Stack:** Next.js 15, React 19, TypeScript, Ant Design, `antd-style` (CSS-in-JS), `react-layout-kit`, `lucide-react`, `react-i18next`, Vitest

**Known Limitation:** CORS — browser `fetch()` is subject to CORS. Requests to servers that don't allow cross-origin requests will show a network error. This is expected behavior for browser-based API testers and is not fixable without a server-side proxy (out of scope).

---

## Task 1: Add i18n keys

**Files:**
- Modify: `src/locales/default/tools.ts`
- Modify: `locales/en-US/tools.json`
- Modify: `locales/zh-CN/tools.json`

No tests for i18n. Just add the keys.

**Step 1: Update `src/locales/default/tools.ts`**

Add the `apitest` block before the `title` key:

```ts
export default {
  apitest: {
    addHeader: 'Add Header',
    auth: 'Auth',
    authBasic: 'Basic Auth',
    authBearer: 'Bearer Token',
    authNone: 'None',
    authType: 'Auth Type',
    body: 'Body',
    contentType: 'Content-Type',
    emptyUrl: 'URL is required',
    formatError: 'Invalid JSON — cannot format',
    formatJson: 'Format JSON',
    headerKey: 'Key',
    headerValue: 'Value',
    headers: 'Headers',
    invalidUrl: 'Please enter a valid URL (must start with http:// or https://)',
    method: 'Method',
    networkError: 'Network error',
    password: 'Password',
    raw: 'Raw',
    response: 'Response',
    responseBody: 'Body',
    responseHeaders: 'Headers',
    send: 'Send',
    sending: 'Sending...',
    status: 'Status',
    time: 'Time',
    title: 'API Tester',
    token: 'Token',
    url: 'URL',
    username: 'Username',
  },
  picbed: {
    // ... (keep existing)
  },
  // ...
};
```

Exact replacement — add `apitest: { ... },` as the first key in the object (before `picbed`).

**Step 2: Update `locales/en-US/tools.json`**

Add the `apitest` block (same keys, same English values):

```json
{
  "apitest": {
    "addHeader": "Add Header",
    "auth": "Auth",
    "authBasic": "Basic Auth",
    "authBearer": "Bearer Token",
    "authNone": "None",
    "authType": "Auth Type",
    "body": "Body",
    "contentType": "Content-Type",
    "emptyUrl": "URL is required",
    "formatError": "Invalid JSON — cannot format",
    "formatJson": "Format JSON",
    "headerKey": "Key",
    "headerValue": "Value",
    "headers": "Headers",
    "invalidUrl": "Please enter a valid URL (must start with http:// or https://)",
    "method": "Method",
    "networkError": "Network error",
    "password": "Password",
    "raw": "Raw",
    "response": "Response",
    "responseBody": "Body",
    "responseHeaders": "Headers",
    "send": "Send",
    "sending": "Sending...",
    "status": "Status",
    "time": "Time",
    "title": "API Tester",
    "token": "Token",
    "url": "URL",
    "username": "Username"
  },
  "picbed": { ... }
}
```

**Step 3: Update `locales/zh-CN/tools.json`**

Add Chinese translations:

```json
{
  "apitest": {
    "addHeader": "添加请求头",
    "auth": "认证",
    "authBasic": "Basic 认证",
    "authBearer": "Bearer Token",
    "authNone": "无",
    "authType": "认证类型",
    "body": "请求体",
    "contentType": "Content-Type",
    "emptyUrl": "请输入 URL",
    "formatError": "无效的 JSON，无法格式化",
    "formatJson": "格式化 JSON",
    "headerKey": "键",
    "headerValue": "值",
    "headers": "请求头",
    "invalidUrl": "请输入有效的 URL（必须以 http:// 或 https:// 开头）",
    "method": "方法",
    "networkError": "网络错误",
    "password": "密码",
    "raw": "原始",
    "response": "响应",
    "responseBody": "响应体",
    "responseHeaders": "响应头",
    "send": "发送",
    "sending": "发送中...",
    "status": "状态",
    "time": "耗时",
    "title": "API 测试",
    "token": "Token",
    "url": "URL",
    "username": "用户名"
  }
}
```

**Step 4: Commit**

```bash
git add src/locales/default/tools.ts locales/en-US/tools.json locales/zh-CN/tools.json
git commit -m "🌐 i18n: add API Tester translations to tools namespace"
```

---

## Task 2: Add Nav entry and page scaffold

**Files:**
- Modify: `src/app/[variants]/(main)/tools/_layout/Desktop/Nav.tsx`
- Create: `src/app/[variants]/(main)/tools/apitest/page.tsx`

No tests needed for these files.

**Step 1: Update `Nav.tsx`**

Add `Zap` to the lucide-react import and add the apitest item:

```tsx
'use client';

import { Icon } from '@lobehub/ui';
import { Images, KeyRound, Zap } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Menu from '@/components/Menu';

const Nav = memo(() => {
  const { t } = useTranslation('tools');
  const pathname = usePathname();
  const router = useRouter();

  const activeKey = pathname.split('/').at(-1) || 'picbed';

  const items = [
    {
      icon: <Icon icon={Images} />,
      key: 'picbed',
      label: t('picbed.title'),
    },
    {
      icon: <Icon icon={KeyRound} />,
      key: 'password',
      label: t('password.title'),
    },
    {
      icon: <Icon icon={Zap} />,
      key: 'apitest',
      label: t('apitest.title'),
    },
  ];

  return (
    <Menu
      compact
      items={items}
      onClick={({ key }) => router.push(`/tools/${key}`)}
      selectedKeys={[activeKey]}
      selectable
    />
  );
});

Nav.displayName = 'ToolsNav';

export default Nav;
```

**Step 2: Create `src/app/[variants]/(main)/tools/apitest/page.tsx`**

```tsx
import { Suspense } from 'react';

import ApitestWorkspace from './features/ApitestWorkspace';

const ApitestPage = () => {
  return (
    <Suspense>
      <ApitestWorkspace />
    </Suspense>
  );
};

ApitestPage.displayName = 'ApitestPage';

export default ApitestPage;
```

**Step 3: Commit**

```bash
git add src/app/[variants]/\(main\)/tools/_layout/Desktop/Nav.tsx \
        src/app/[variants]/\(main\)/tools/apitest/page.tsx
git commit -m "✨ feat(tools): add API Tester nav entry and page scaffold"
```

---

## Task 3: Write and test helper functions

These are pure functions extracted from the workspace component. Write tests first (TDD).

**Files:**
- Create: `src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/helpers.ts`
- Create: `src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/helpers.test.ts`

**Step 1: Write the failing tests**

Create `helpers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { buildAuthHeader, formatJson, isValidUrl } from './helpers';

describe('isValidUrl', () => {
  it('accepts http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('accepts https URLs', () => {
    expect(isValidUrl('https://api.example.com/v1/users')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('rejects URL without protocol', () => {
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('rejects ftp URLs', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });
});

describe('buildAuthHeader', () => {
  it('returns undefined for none', () => {
    expect(buildAuthHeader('none', '', '', '')).toBeUndefined();
  });

  it('returns Bearer header', () => {
    expect(buildAuthHeader('bearer', 'mytoken123', '', '')).toBe('Bearer mytoken123');
  });

  it('returns undefined for bearer with empty token', () => {
    expect(buildAuthHeader('bearer', '', '', '')).toBeUndefined();
  });

  it('returns Basic header (base64 encoded)', () => {
    const header = buildAuthHeader('basic', '', 'user', 'pass');
    expect(header).toBe(`Basic ${btoa('user:pass')}`);
  });

  it('returns undefined for basic with empty username and password', () => {
    expect(buildAuthHeader('basic', '', '', '')).toBeUndefined();
  });
});

describe('formatJson', () => {
  it('formats valid JSON', () => {
    const result = formatJson('{"a":1,"b":2}');
    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('throws on invalid JSON', () => {
    expect(() => formatJson('not json')).toThrow();
  });

  it('handles nested objects', () => {
    const result = formatJson('{"a":{"b":1}}');
    expect(result).toBe('{\n  "a": {\n    "b": 1\n  }\n}');
  });
});
```

**Step 2: Run to verify tests fail**

```bash
bunx vitest run --silent='passed-only' 'src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/helpers.test.ts'
```

Expected: FAIL — "Cannot find module './helpers'"

**Step 3: Create `helpers.ts`**

```ts
export type AuthType = 'basic' | 'bearer' | 'none';

/**
 * Validates that a URL starts with http:// or https://
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Builds the Authorization header value based on auth type.
 * Returns undefined if auth type is 'none' or required fields are empty.
 */
export const buildAuthHeader = (
  type: AuthType,
  token: string,
  username: string,
  password: string,
): string | undefined => {
  if (type === 'bearer') {
    return token.trim() ? `Bearer ${token.trim()}` : undefined;
  }
  if (type === 'basic') {
    if (!username && !password) return undefined;
    return `Basic ${btoa(`${username}:${password}`)}`;
  }
  return undefined;
};

/**
 * Pretty-prints JSON string with 2-space indentation.
 * Throws SyntaxError if input is not valid JSON.
 */
export const formatJson = (text: string): string => {
  return JSON.stringify(JSON.parse(text), null, 2);
};
```

**Step 4: Run to verify tests pass**

```bash
bunx vitest run --silent='passed-only' 'src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/helpers.test.ts'
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add 'src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/helpers.ts' \
        'src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/helpers.test.ts'
git commit -m "✅ test(tools): add helper function tests for API Tester"
```

---

## Task 4: Build the main ApitestWorkspace component

**Files:**
- Create: `src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/index.tsx`

This is a large client component. Write it all at once as a single file.

**Step 1: Create `index.tsx`**

```tsx
'use client';

import { App, Button, Divider, Input, Radio, Select, Tabs, Tag, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Plus, Send, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { AuthType, buildAuthHeader, formatJson, isValidUrl } from './helpers';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderRow {
  enabled: boolean;
  key: string;
  value: string;
}

interface ResponseState {
  body: string;
  error?: string;
  headers: Record<string, string>;
  isJson: boolean;
  status: number;
  statusText: string;
  time: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

const CONTENT_TYPES = [
  { label: 'application/json', value: 'application/json' },
  { label: 'text/plain', value: 'text/plain' },
  { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    padding: 20px;
  `,
  codeBlock: css`
    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    background: ${token.colorFillTertiary};
    border-radius: ${token.borderRadius}px;
    padding: 12px;
    margin: 0;
    max-height: 400px;
    overflow: auto;
  `,
  errorBanner: css`
    background: ${token.colorErrorBg};
    border: 1px solid ${token.colorErrorBorder};
    border-radius: ${token.borderRadius}px;
    color: ${token.colorError};
    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    padding: 12px;
  `,
  headerRow: css`
    border-bottom: 1px solid ${token.colorBorderSecondary};
    padding: 6px 0;
    &:last-child {
      border-bottom: none;
    }
  `,
  label: css`
    color: ${token.colorTextSecondary};
    font-size: 13px;
    min-width: 120px;
  `,
  methodSelect: css`
    width: 120px;
    font-weight: 600;
  `,
  responseHeaderItem: css`
    border-bottom: 1px solid ${token.colorBorderSecondary};
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    padding: 6px 0;
    &:last-child {
      border-bottom: none;
    }
  `,
  statusBar: css`
    font-size: 13px;
  `,
  textarea: css`
    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    resize: vertical;
  `,
  title: css`
    margin-bottom: 0 !important;
  `,
  urlInput: css`
    flex: 1;
    font-family: ${token.fontFamilyCode};
    font-size: 13px;
  `,
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusTag = ({ status }: { status: number }) => {
  if (status === 0) return null;
  const color =
    status >= 500 ? 'error' : status >= 400 ? 'error' : status >= 300 ? 'warning' : 'success';
  return (
    <Tag color={color} style={{ fontSize: 13, fontWeight: 600, padding: '2px 10px' }}>
      {status}
    </Tag>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ApitestWorkspace = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('tools');
  const { message } = App.useApp();

  // Request state
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [authType, setAuthType] = useState<AuthType>('none');
  const [bearerToken, setBearerToken] = useState('');
  const [basicUsername, setBasicUsername] = useState('');
  const [basicPassword, setBasicPassword] = useState('');
  const [headers, setHeaders] = useState<HeaderRow[]>([{ enabled: true, key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [contentType, setContentType] = useState('application/json');

  // Response state
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeResponseTab, setActiveResponseTab] = useState<string>('body');
  const [rawMode, setRawMode] = useState(false);

  // ── Header row helpers ──────────────────────────────────────────────────────

  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { enabled: true, key: '', value: '' }]);
  }, []);

  const removeHeader = useCallback((index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateHeader = useCallback((index: number, field: keyof HeaderRow, val: string | boolean) => {
    setHeaders((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)),
    );
  }, []);

  // ── Format JSON button ──────────────────────────────────────────────────────

  const handleFormatJson = useCallback(() => {
    try {
      setBody(formatJson(body));
    } catch {
      message.error(t('apitest.formatError'));
    }
  }, [body, message, t]);

  // ── Send request ────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if (!url.trim()) {
      message.error(t('apitest.emptyUrl'));
      return;
    }
    if (!isValidUrl(url.trim())) {
      message.error(t('apitest.invalidUrl'));
      return;
    }

    const requestHeaders: Record<string, string> = {};

    const authHeader = buildAuthHeader(authType, bearerToken, basicUsername, basicPassword);
    if (authHeader) requestHeaders['Authorization'] = authHeader;

    const hasBody = BODY_METHODS.has(method);
    if (hasBody && body.trim()) requestHeaders['Content-Type'] = contentType;

    for (const h of headers) {
      if (h.enabled && h.key.trim()) {
        requestHeaders[h.key.trim()] = h.value;
      }
    }

    setLoading(true);
    const start = Date.now();

    try {
      const res = await fetch(url.trim(), {
        body: hasBody && body.trim() ? body : undefined,
        headers: requestHeaders,
        method,
      });

      const time = Date.now() - start;
      const text = await res.text();

      const ct = res.headers.get('content-type') || '';
      let isJson = ct.includes('application/json');
      if (!isJson) {
        try {
          JSON.parse(text);
          isJson = true;
        } catch {
          // not JSON
        }
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      setResponse({ body: text, headers: resHeaders, isJson, status: res.status, statusText: res.statusText, time });
    } catch (err) {
      setResponse({
        body: '',
        error: err instanceof Error ? err.message : String(err),
        headers: {},
        isJson: false,
        status: 0,
        statusText: '',
        time: Date.now() - start,
      });
    } finally {
      setLoading(false);
      setActiveResponseTab('body');
      setRawMode(false);
    }
  }, [authType, basicPassword, basicUsername, bearerToken, body, contentType, headers, message, method, t, url]);

  // ── Formatted response body ─────────────────────────────────────────────────

  const formattedBody = useMemo(() => {
    if (!response?.isJson || !response.body) return response?.body || '';
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      return response.body;
    }
  }, [response]);

  const displayBody = rawMode ? (response?.body ?? '') : formattedBody;

  // ─── Render ────────────────────────────────────────────────────────────────

  const hasBody = BODY_METHODS.has(method);

  const requestTabs = [
    {
      children: (
        // Auth tab
        <Flexbox gap={16} style={{ padding: '16px 0' }}>
          <Flexbox align={'center'} gap={12} horizontal>
            <span className={styles.label}>{t('apitest.authType')}</span>
            <Radio.Group
              onChange={(e) => setAuthType(e.target.value)}
              options={[
                { label: t('apitest.authNone'), value: 'none' },
                { label: t('apitest.authBearer'), value: 'bearer' },
                { label: t('apitest.authBasic'), value: 'basic' },
              ]}
              value={authType}
            />
          </Flexbox>

          {authType === 'bearer' && (
            <Flexbox align={'center'} gap={12} horizontal>
              <span className={styles.label}>{t('apitest.token')}</span>
              <Input.Password
                onChange={(e) => setBearerToken(e.target.value)}
                placeholder={'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                style={{ flex: 1, fontFamily: 'monospace' }}
                value={bearerToken}
              />
            </Flexbox>
          )}

          {authType === 'basic' && (
            <>
              <Flexbox align={'center'} gap={12} horizontal>
                <span className={styles.label}>{t('apitest.username')}</span>
                <Input
                  onChange={(e) => setBasicUsername(e.target.value)}
                  placeholder={'username'}
                  style={{ flex: 1 }}
                  value={basicUsername}
                />
              </Flexbox>
              <Flexbox align={'center'} gap={12} horizontal>
                <span className={styles.label}>{t('apitest.password')}</span>
                <Input.Password
                  onChange={(e) => setBasicPassword(e.target.value)}
                  placeholder={'password'}
                  style={{ flex: 1 }}
                  value={basicPassword}
                />
              </Flexbox>
            </>
          )}
        </Flexbox>
      ),
      key: 'auth',
      label: t('apitest.auth'),
    },
    {
      children: (
        // Headers tab
        <Flexbox gap={8} style={{ padding: '16px 0' }}>
          {headers.map((row, i) => (
            <Flexbox align={'center'} className={styles.headerRow} gap={8} horizontal key={i}>
              <Input
                className={styles.urlInput}
                onChange={(e) => updateHeader(i, 'key', e.target.value)}
                placeholder={t('apitest.headerKey')}
                value={row.key}
              />
              <Input
                className={styles.urlInput}
                onChange={(e) => updateHeader(i, 'value', e.target.value)}
                placeholder={t('apitest.headerValue')}
                value={row.value}
              />
              <Tooltip title={'Remove'}>
                <Button
                  danger
                  icon={<Trash2 size={14} />}
                  onClick={() => removeHeader(i)}
                  size={'small'}
                  type={'text'}
                />
              </Tooltip>
            </Flexbox>
          ))}
          <Button
            icon={<Plus size={14} />}
            onClick={addHeader}
            size={'small'}
            style={{ alignSelf: 'flex-start' }}
            type={'dashed'}
          >
            {t('apitest.addHeader')}
          </Button>
        </Flexbox>
      ),
      key: 'headers',
      label: t('apitest.headers'),
    },
    {
      children: (
        // Body tab
        <Flexbox gap={12} style={{ padding: '16px 0' }}>
          {!hasBody ? (
            <Typography.Text type={'secondary'} style={{ fontSize: 13 }}>
              Body is only available for POST, PUT, and PATCH requests.
            </Typography.Text>
          ) : (
            <>
              <Flexbox align={'center'} gap={12} horizontal>
                <span className={styles.label}>{t('apitest.contentType')}</span>
                <Select
                  onChange={setContentType}
                  options={CONTENT_TYPES}
                  size={'small'}
                  style={{ width: 280 }}
                  value={contentType}
                />
                <Button onClick={handleFormatJson} size={'small'} type={'dashed'}>
                  {t('apitest.formatJson')}
                </Button>
              </Flexbox>
              <Input.TextArea
                className={styles.textarea}
                onChange={(e) => setBody(e.target.value)}
                placeholder={'{"key": "value"}'}
                rows={10}
                value={body}
              />
            </>
          )}
        </Flexbox>
      ),
      key: 'body',
      label: t('apitest.body'),
    },
  ];

  const responseTabs = [
    {
      children: (
        <Flexbox gap={8} style={{ padding: '16px 0' }}>
          {response?.error ? (
            <div className={styles.errorBanner}>
              {t('apitest.networkError')}: {response.error}
            </div>
          ) : (
            <>
              <Flexbox align={'center'} horizontal justify={'flex-end'}>
                <Button
                  onClick={() => setRawMode((v) => !v)}
                  size={'small'}
                  type={'text'}
                >
                  {rawMode ? t('apitest.formatted') : t('apitest.raw')}
                </Button>
              </Flexbox>
              <pre className={styles.codeBlock}>{displayBody || '(empty body)'}</pre>
            </>
          )}
        </Flexbox>
      ),
      key: 'body',
      label: t('apitest.responseBody'),
    },
    {
      children: (
        <Flexbox gap={4} style={{ padding: '16px 0' }}>
          {Object.entries(response?.headers ?? {}).map(([k, v]) => (
            <Flexbox className={styles.responseHeaderItem} gap={8} horizontal key={k}>
              <Typography.Text strong style={{ fontFamily: 'monospace', fontSize: 12, minWidth: 200 }}>
                {k}
              </Typography.Text>
              <Typography.Text style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
                {v}
              </Typography.Text>
            </Flexbox>
          ))}
        </Flexbox>
      ),
      key: 'headers',
      label: t('apitest.responseHeaders'),
    },
  ];

  return (
    <Flexbox gap={20}>
      <Typography.Title className={styles.title} level={4}>
        {t('apitest.title')}
      </Typography.Title>

      {/* ── Request Builder ── */}
      <Flexbox className={styles.card} gap={12}>
        {/* Method + URL + Send */}
        <Flexbox align={'center'} gap={8} horizontal>
          <Select
            className={styles.methodSelect}
            onChange={setMethod}
            options={HTTP_METHODS.map((m) => ({ label: m, value: m }))}
            value={method}
          />
          <Input
            className={styles.urlInput}
            onPressEnter={handleSend}
            placeholder={'https://api.example.com/v1/users'}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            icon={<Send size={14} />}
            loading={loading}
            onClick={handleSend}
            type={'primary'}
          >
            {loading ? t('apitest.sending') : t('apitest.send')}
          </Button>
        </Flexbox>

        <Divider style={{ margin: '4px 0' }} />

        {/* Auth / Headers / Body tabs */}
        <Tabs
          activeKey={'auth'}
          items={requestTabs}
          size={'small'}
          tabBarStyle={{ marginBottom: 0 }}
        />
      </Flexbox>

      {/* ── Response Panel ── */}
      {response !== null && (
        <Flexbox className={styles.card} gap={0}>
          {/* Status bar */}
          <Flexbox align={'center'} className={styles.statusBar} gap={16} horizontal>
            <StatusTag status={response.status} />
            {response.status > 0 && (
              <Typography.Text type={'secondary'}>
                {response.statusText}
              </Typography.Text>
            )}
            <Typography.Text type={'secondary'}>
              {response.time}ms
            </Typography.Text>
          </Flexbox>

          <Divider style={{ margin: '12px 0 0' }} />

          {/* Body / Headers tabs */}
          <Tabs
            activeKey={activeResponseTab}
            items={responseTabs}
            onChange={setActiveResponseTab}
            size={'small'}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </Flexbox>
      )}
    </Flexbox>
  );
});

ApitestWorkspace.displayName = 'ApitestWorkspace';

export default ApitestWorkspace;
```

> **Note on `Tabs` activeKey for request tabs:** The request tabs use a controlled `activeKey` defaulting to `'auth'`. If you want the tabs to be freely switchable by the user, change it to use `useState` like `activeResponseTab`. This is intentional for now — auth is always the first visible tab.

Actually, **correct the Tabs for request tabs** — they must be user-switchable. Use this instead:

```tsx
const [activeRequestTab, setActiveRequestTab] = useState('auth');

// In the JSX:
<Tabs
  activeKey={activeRequestTab}
  items={requestTabs}
  onChange={setActiveRequestTab}
  size={'small'}
  tabBarStyle={{ marginBottom: 0 }}
/>
```

Add `activeRequestTab` and `setActiveRequestTab` to the component state declarations.

**Step 2: Run type-check**

```bash
bun run type-check
```

Fix any TypeScript errors before proceeding.

**Step 3: Commit**

```bash
git add 'src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/index.tsx'
git commit -m "✨ feat(tools): implement API Tester workspace UI"
```

---

## Task 5: Final verification

**Step 1: Run all apitest tests**

```bash
bunx vitest run --silent='passed-only' 'src/app/[variants]/(main)/tools/apitest/**'
```

Expected: All tests pass.

**Step 2: Run type-check**

```bash
bun run type-check
```

Expected: No errors.

**Step 3: Verify lint**

```bash
bun run lint:ts
```

Expected: No errors.

**Step 4: Final commit if any lint fixes were needed**

```bash
git add -p
git commit -m "🔧 fix(tools): address lint issues in API Tester"
```

---

## Summary of Files Changed

| Action | File |
|--------|------|
| Modify | `src/locales/default/tools.ts` |
| Modify | `locales/en-US/tools.json` |
| Modify | `locales/zh-CN/tools.json` |
| Modify | `src/app/[variants]/(main)/tools/_layout/Desktop/Nav.tsx` |
| Create | `src/app/[variants]/(main)/tools/apitest/page.tsx` |
| Create | `src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/helpers.ts` |
| Create | `src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/helpers.test.ts` |
| Create | `src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/index.tsx` |

No database changes. No tRPC changes. No middleware changes.
