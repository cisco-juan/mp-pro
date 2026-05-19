import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Servicios API (e2e)', () => {
  let accessToken = '';
  let createdId = '';

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

  it('GET /services — lista servicios sembrados', async () => {
    const res = await api.get('/services', authHeaders());
    expect(res.status).toBe(200);
    expect(res.data.some((s: { id: string }) => s.id === 'sv1')).toBe(true);
  });

  it('POST /services — crea servicio', async () => {
    const res = await api.post(
      '/services',
      {
        nombre: 'Servicio E2E',
        descripcion: 'Prueba',
        precio: 99.5,
        duracionMin: 45,
        categoria: 'E2E',
      },
      authHeaders(),
    );
    expect(res.status).toBe(201);
    createdId = res.data.id;
    expect(res.data.nombre).toBe('Servicio E2E');
  });

  it('PATCH /services/:id/toggle-active — desactiva servicio', async () => {
    const res = await api.patch(`/services/${createdId}/toggle-active`, {}, authHeaders());
    expect(res.status).toBe(200);
    expect(res.data.activo).toBe(false);
  });
});
