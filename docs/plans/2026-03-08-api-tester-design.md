# API Tester Tool — Design Document

**Date**: 2026-03-08
**Status**: Approved
**Route**: `/tools/apitest`

---

## Overview

A stateless REST API testing tool in the Tools Hub, similar to Postman. Runs entirely client-side — no database, no tRPC, no server interaction. All state is in-memory and lost on page refresh.

---

## Architecture

Follows the **Password tool pattern** (client-only, no backend):

```
src/app/[variants]/(main)/tools/apitest/
├── page.tsx                          # Suspense wrapper
└── features/ApitestWorkspace/
    └── index.tsx                     # Main UI component (all state here)
```

No DB schema, no migration, no tRPC router, no service layer.

---

## UI Layout

Two-panel vertical layout:

### Top Panel — Request Builder
1. **Method + URL row**: Method dropdown (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) + URL input + Send button
2. **Tab bar**: Auth | Headers | Body
   - **Auth tab**: Radio selector — None / Bearer Token / Basic Auth
     - Bearer: single token input
     - Basic: username + password inputs
   - **Headers tab**: Key-value row editor (add/remove rows, toggle enabled)
   - **Body tab**: Visible only for POST, PUT, PATCH methods
     - Content-Type selector: `application/json` | `text/plain` | `application/x-www-form-urlencoded`
     - Textarea (monospace font) with **Format JSON** button (prettifies if valid JSON)

### Bottom Panel — Response Viewer
Appears after first request is sent.

- **Status bar**: HTTP status code (colored: green 2xx, yellow 3xx, red 4xx/5xx) + status text + response time (ms)
- **Tab bar**: Body | Headers
  - **Body tab**: Pretty-printed JSON (if `Content-Type: application/json`) or raw text. **Raw** toggle to switch between formatted and unformatted. Monospace font.
  - **Headers tab**: Read-only key-value list of response headers

---

## Data Flow

```
User fills request → clicks Send
  → build Headers object (from auth + headers tab + content-type)
  → fetch(url, { method, headers, body })
  → measure response time
  → read response.text()
  → detect JSON (try JSON.parse + check Content-Type)
  → update response state → render
```

Auth injection:
- Bearer: adds `Authorization: Bearer <token>` header
- Basic: adds `Authorization: Basic <base64(user:pass)>` header

---

## Error Handling

- Network errors (no connection, CORS, timeout): show error message in response panel (red banner)
- Invalid URL: show inline validation error before sending
- Invalid JSON in body: Format button shows toast error; request still sends raw text
- Non-JSON response: display as raw text

---

## i18n Keys (new in `tools.ts`)

```ts
apitest: {
  title: 'API Tester',
  method: 'Method',
  url: 'URL',
  send: 'Send',
  sending: 'Sending...',
  auth: 'Auth',
  headers: 'Headers',
  body: 'Body',
  authType: 'Auth Type',
  authNone: 'None',
  authBearer: 'Bearer Token',
  authBasic: 'Basic Auth',
  token: 'Token',
  username: 'Username',
  password: 'Password',
  contentType: 'Content-Type',
  formatJson: 'Format JSON',
  formatError: 'Invalid JSON',
  addHeader: 'Add Header',
  headerKey: 'Key',
  headerValue: 'Value',
  response: 'Response',
  responseBody: 'Body',
  responseHeaders: 'Headers',
  raw: 'Raw',
  formatted: 'Formatted',
  status: 'Status',
  time: 'Time',
  networkError: 'Network error',
  invalidUrl: 'Please enter a valid URL',
  emptyUrl: 'URL is required',
  bodyOnlyForMethods: 'Body is only available for POST, PUT, and PATCH requests',
}
```

---

## Nav Registration

Add to `Nav.tsx` items array:
```ts
{ icon: <Icon icon={Zap} />, key: 'apitest', label: t('apitest.title') }
```

(Using `Zap` from lucide-react as the API tester icon — represents fast HTTP calls)

---

## Files to Create / Modify

| Action | File |
|--------|------|
| Create | `src/app/[variants]/(main)/tools/apitest/page.tsx` |
| Create | `src/app/[variants]/(main)/tools/apitest/features/ApitestWorkspace/index.tsx` |
| Modify | `src/app/[variants]/(main)/tools/_layout/Desktop/Nav.tsx` |
| Modify | `src/locales/default/tools.ts` |
| Modify | `locales/en-US/tools.json` |
| Modify | `locales/zh-CN/tools.json` |

No DB, no migration, no tRPC changes needed.

---

## Out of Scope

- Saving/loading requests (no persistence)
- Multiple request tabs
- Environment variables
- Request history
- cURL import/export
- Code snippet generation
- WebSocket / GraphQL support
