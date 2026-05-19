import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Órdenes comerciales API (e2e)', () => {
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

  it('GET /commercial-orders — lista órdenes sembradas', async () => {
    const res = await api.get('/commercial-orders', authHeaders());
    expect(res.status).toBe(200);
    expect(res.data.some((o: { id: string }) => o.id === 'oc1')).toBe(true);
    const oc1 = res.data.find((o: { id: string }) => o.id === 'oc1');
    expect(oc1.ordenTrabajoId).toBe('o1');
    expect(oc1.lineas.length).toBeGreaterThan(0);
  });

  it('POST /commercial-orders/from-work-order — genera cotización desde OT', async () => {
    const res = await api.post(
      '/commercial-orders/from-work-order',
      { ordenTrabajoId: 'o3' },
      authHeaders(),
    );
    expect(res.status).toBe(201);
    expect(res.data.tipo).toBe('cotizacion');
    expect(res.data.ordenTrabajoId).toBe('o3');
  });

  it('PATCH /commercial-orders/:id/estado — envía cotización', async () => {
    const res = await api.patch(
      '/commercial-orders/oc1/estado',
      { estado: 'enviada' },
      authHeaders(),
    );
    expect(res.status).toBe(200);
    expect(res.data.estado).toBe('enviada');
  });
});
