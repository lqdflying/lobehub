'use client';

import { App, Button, Divider, Input, Radio, Select, Tabs, Tag, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Plus, Send, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { type AuthType, buildAuthHeader, formatJson, isValidUrl } from './helpers';

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
    padding: 20px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
  `,
  codeBlock: css`
    overflow: auto;

    max-height: 400px;
    margin: 0;
    padding: 12px;
    border-radius: ${token.borderRadius}px;

    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    line-height: 1.6;
    word-break: break-all;
    white-space: pre-wrap;

    background: ${token.colorFillTertiary};
  `,
  errorBanner: css`
    padding: 12px;
    border: 1px solid ${token.colorErrorBorder};
    border-radius: ${token.borderRadius}px;

    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    color: ${token.colorError};

    background: ${token.colorErrorBg};
  `,
  headerRow: css`
    padding-block: 6px;
    padding-inline: 0;
    border-block-end: 1px solid ${token.colorBorderSecondary};

    &:last-child {
      border-block-end: none;
    }
  `,
  label: css`
    min-width: 120px;
    font-size: 13px;
    color: ${token.colorTextSecondary};
  `,
  methodSelect: css`
    width: 120px;
    font-weight: 600;
  `,
  responseHeaderItem: css`
    padding-block: 6px;
    padding-inline: 0;
    border-block-end: 1px solid ${token.colorBorderSecondary};

    font-family: ${token.fontFamilyCode};
    font-size: 12px;

    &:last-child {
      border-block-end: none;
    }
  `,
  statusBar: css`
    font-size: 13px;
  `,
  textarea: css`
    resize: vertical;
    font-family: ${token.fontFamilyCode};
    font-size: 13px;
  `,
  title: css`
    margin-block-end: 0 !important;
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
  const [activeRequestTab, setActiveRequestTab] = useState('auth');

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

  const updateHeader = useCallback(
    (index: number, field: keyof HeaderRow, val: string | boolean) => {
      setHeaders((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)));
    },
    [],
  );

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

      setResponse({
        body: text,
        headers: resHeaders,
        isJson,
        status: res.status,
        statusText: res.statusText,
        time,
      });
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
  }, [
    authType,
    basicPassword,
    basicUsername,
    bearerToken,
    body,
    contentType,
    headers,
    message,
    method,
    t,
    url,
  ]);

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
        <Flexbox gap={12} style={{ padding: '16px 0' }}>
          {!hasBody ? (
            <Typography.Text style={{ fontSize: 13 }} type={'secondary'}>
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
                <Button onClick={() => setRawMode((v) => !v)} size={'small'} type={'text'}>
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
              <Typography.Text
                strong
                style={{ fontFamily: 'monospace', fontSize: 12, minWidth: 200 }}
              >
                {k}
              </Typography.Text>
              <Typography.Text
                style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}
              >
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
            onChange={(e) => setUrl(e.target.value)}
            onPressEnter={handleSend}
            placeholder={'https://api.example.com/v1/users'}
            value={url}
          />
          <Button icon={<Send size={14} />} loading={loading} onClick={handleSend} type={'primary'}>
            {loading ? t('apitest.sending') : t('apitest.send')}
          </Button>
        </Flexbox>

        <Divider style={{ margin: '4px 0' }} />

        {/* Auth / Headers / Body tabs */}
        <Tabs
          activeKey={activeRequestTab}
          items={requestTabs}
          onChange={setActiveRequestTab}
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
              <Typography.Text type={'secondary'}>{response.statusText}</Typography.Text>
            )}
            <Typography.Text type={'secondary'}>{response.time}ms</Typography.Text>
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
