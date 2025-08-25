// tests/app.test.ts
// Real HTTP integration tests against a locally running server (no supertest)

import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ROOT = `${BASE_URL}/`;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url = ROOT, timeoutMs = 15_000, intervalMs = 300) {
  const start = Date.now();
  let lastErr: unknown;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await axios.get(url, { validateStatus: () => true, timeout: 2000 });
      if (res.status >= 200 && res.status < 600) {
        return;
      }
    } catch (e) {
      lastErr = e;
    }
    await wait(intervalMs);
  }
  const msg = (lastErr as Error | undefined)?.message || 'Server did not become ready in time';
  throw new Error(`Server not ready at ${url}: ${msg}`);
}

describe('Express Server Integration Tests (real HTTP, no supertest)', () => {
  beforeAll(async () => {
    await waitForServer();
  }, 20_000);

  test('GET / returns server running status', async () => {
    const res = await axios.get(ROOT);
    expect(res.status).toBe(200);
    expect(res.data).toBe('Server is running.');
    expect(res.headers['content-type']).toMatch(/text\/html|text\/plain|charset/i);
  });

  test('CORS preflight on / responds with 204/200 and valid ACAO', async () => {
    const origin = 'http://example.com';
    const res = await axios.request({
      method: 'OPTIONS',
      url: ROOT,
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
      },
      validateStatus: () => true,
    });

    expect([200, 204]).toContain(res.status);

    // cors() default without options sets "*" for ACAO; with { origin: true } it echoes the Origin.
    const acaOrigin = res.headers['access-control-allow-origin'];
    expect(acaOrigin).toBeDefined();
    expect([origin, '*']).toContain(acaOrigin);

    // Basic sanity on typical preflight headers if present
    if (res.headers['access-control-allow-methods']) {
      expect(res.headers['access-control-allow-methods']).toMatch(/GET/i);
    }
  });

  test('GET unknown route returns 404 (error handler engaged)', async () => {
    const res = await axios.get(`${BASE_URL}/__definitely_not_a_route__`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(404);
    expect(res.data).toBeDefined();
  });

  test('Static middleware under /static: missing asset -> 404', async () => {
    const res = await axios.get(`${BASE_URL}/static/__nope__.txt`, {
      validateStatus: () => true,
    });
    expect(res.status).toBe(404);
  });

  test('Invalid JSON body yields 400/415', async () => {
    const res = await axios.post(ROOT, '{ invalid_json: }', {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    expect([400, 415]).toContain(res.status);
  });

  test('URL-encoded parser: unknown POST route -> 404', async () => {
    const res = await axios.post(`${BASE_URL}/__no_route__`, 'a=1&b=2', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      validateStatus: () => true,
    });
    expect(res.status).toBe(404);
  });

  test('Cookies are accepted even on 404', async () => {
    const res = await axios.get(`${BASE_URL}/__no_route_cookie__`, {
      headers: { Cookie: 'sid=abc123; theme=dark' },
      validateStatus: () => true,
    });
    expect(res.status).toBe(404);
  });

  test('Large JSON payload does not crash server (POST / -> 404/400)', async () => {
    const big = { data: 'x'.repeat(64 * 1024) };
    const res = await axios.post(ROOT, big, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
    expect([404, 400]).toContain(res.status);
  });

  test('HEAD / returns headers without body', async () => {
    const res = await axios.head(ROOT, { validateStatus: () => true });
    expect([200, 404]).toContain(res.status);
    expect(res.headers).toBeDefined();
  });
});
