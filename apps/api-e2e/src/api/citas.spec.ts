import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Citas API (e2e)', () => {
  let accessToken = '';
  let createdId = '';

  beforeAll(async () => {
    const login = await api.post('/auth/login', {
      email: 'antonio.reyes@mppro.local',
      password: 'Admin123!',
    });
    expect(login.status).toBe(200);
    accessToken = login.data.accessToken;
  });

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  it('GET /appointments — lista citas', async () => {
    const res = await api.get('/appointments', authHeaders());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.some((c: { id: string }) => c.id === 'ci1')).toBe(true);
  });

  it('POST /appointments — crea cita', async () => {
    const res = await api.post(
      '/appointments',
      {
        clienteId: 'c1',
        vehiculoId: 'v1',
        servicioId: 'sv1',
        fecha: '2026-06-01',
        hora: '11:00',
        duracionMin: 60,
      },
      authHeaders(),
    );
    expect(res.status).toBe(201);
    createdId = res.data.id;
    expect(res.data.estado).toBe('pendiente');
  });

  it('PATCH /appointments/:id/estado — confirma cita', async () => {
    const res = await api.patch(
      `/appointments/${createdId}/estado`,
      { estado: 'confirmada' },
      authHeaders(),
    );
    expect(res.status).toBe(200);
    expect(res.data.estado).toBe('confirmada');
  });
});
