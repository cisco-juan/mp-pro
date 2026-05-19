import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Configuración taller API (e2e)', () => {
  let accessToken = '';

  beforeAll(async () => {
    const login = await api.post('/auth/login', {
      email: 'admin@mppro.local',
      password: 'Admin123!',
    });
    expect(login.status).toBe(200);
    accessToken = login.data.accessToken;
  });

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  it('GET /settings/workshop — devuelve configuración', async () => {
    const res = await api.get('/settings/workshop', authHeaders());
    expect(res.status).toBe(200);
    expect(res.data.nombreTaller).toBe('Taller MP Pro');
    expect(res.data.ivaPorcentaje).toBe(21);
  });

  it('PATCH /settings/workshop — actualiza bahías', async () => {
    const res = await api.patch(
      '/settings/workshop',
      { bahias: 7 },
      authHeaders(),
    );
    expect(res.status).toBe(200);
    expect(res.data.bahias).toBe(7);

    await api.patch('/settings/workshop', { bahias: 6 }, authHeaders());
  });
});
