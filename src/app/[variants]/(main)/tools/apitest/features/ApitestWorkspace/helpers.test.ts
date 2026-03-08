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
