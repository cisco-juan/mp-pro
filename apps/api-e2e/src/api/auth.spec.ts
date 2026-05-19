import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Auth API (e2e)', () => {
  let accessToken = '';
  let refreshToken = '';

  it('POST /auth/login — credenciales válidas', async () => {
    const res = await api.post('/auth/login', {
      email: 'admin@mppro.local',
      password: 'Admin123!',
    });

    expect(res.status).toBe(200);
    expect(res.data.accessToken).toBeDefined();
    expect(res.data.refreshToken).toBeDefined();
    expect(res.data.user.email).toBe('admin@mppro.local');

    accessToken = res.data.accessToken;
    refreshToken = res.data.refreshToken;
  });

  it('POST /auth/login — credenciales inválidas', async () => {
    const res = await api.post('/auth/login', {
      email: 'admin@mppro.local',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });

  it('GET /auth/me — con token', async () => {
    const res = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.status).toBe(200);
    expect(res.data.email).toBe('admin@mppro.local');
  });

  it('GET /users — requiere permisos', async () => {
    const res = await api.get('/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('GET /roles — autenticado', async () => {
    const res = await api.get('/roles', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.status).toBe(200);
    expect(res.data.some((r: { id: string }) => r.id === 'r1')).toBe(true);
  });

  it('POST /auth/refresh — renueva tokens', async () => {
    const res = await api.post('/auth/refresh', { refreshToken });

    expect(res.status).toBe(200);
    expect(res.data.accessToken).toBeDefined();
    accessToken = res.data.accessToken;
    refreshToken = res.data.refreshToken;
  });

  it('POST /auth/logout — cierra sesión', async () => {
    const res = await api.post(
      '/auth/logout',
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    expect(res.status).toBe(204);
  });
});
