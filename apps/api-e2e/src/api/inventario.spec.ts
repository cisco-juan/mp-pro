import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Inventario API (e2e)', () => {
  let accessToken = '';
  let createdPartId = '';

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

  it('GET /inventory/parts — lista piezas sembradas', async () => {
    const res = await api.get('/inventory/parts', authHeaders());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.some((p: { id: string }) => p.id === 'p1')).toBe(true);
    expect(res.data.find((p: { id: string }) => p.id === 'p7')?.stock).toBe(0);
  });

  it('GET /inventory/parts?categoria=Filtros — filtra por categoría', async () => {
    const res = await api.get('/inventory/parts?categoria=Filtros', authHeaders());

    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThanOrEqual(2);
    expect(res.data.every((p: { categoria: string }) => p.categoria === 'Filtros')).toBe(
      true,
    );
  });

  it('GET /inventory/parts/:id — detalle pieza', async () => {
    const res = await api.get('/inventory/parts/p1', authHeaders());

    expect(res.status).toBe(200);
    expect(res.data.codigo).toBe('FLT-OIL-001');
    expect(res.data.stockMinimo).toBe(10);
  });

  it('POST /inventory/parts — crea pieza', async () => {
    const res = await api.post(
      '/inventory/parts',
      {
        codigo: `E2E-${Date.now()}`,
        nombre: 'Pieza E2E Test',
        categoria: 'Pruebas',
        stock: 5,
        stockMinimo: 2,
        precioUnitario: 19.99,
        ubicacion: 'Z-99',
      },
      authHeaders(),
    );

    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.codigo).toMatch(/^E2E-/);
    createdPartId = res.data.id;
  });

  it('PATCH /inventory/parts/:id — actualiza pieza', async () => {
    const res = await api.patch(
      `/inventory/parts/${createdPartId}`,
      { nombre: 'Pieza E2E Actualizada', stockMinimo: 3 },
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.nombre).toBe('Pieza E2E Actualizada');
    expect(res.data.stockMinimo).toBe(3);
  });

  it('PATCH /inventory/parts/:id/adjust-stock — ajusta stock', async () => {
    const res = await api.patch(
      `/inventory/parts/${createdPartId}/adjust-stock`,
      { delta: -2 },
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.stock).toBe(3);
  });

  it('POST /inventory/parts/:id/reserve — reserva stock', async () => {
    const res = await api.post(
      `/inventory/parts/${createdPartId}/reserve`,
      { cantidad: 1 },
      authHeaders(),
    );

    expect(res.status).toBe(201);
    expect(res.data.stock).toBe(2);
  });

  it('POST /inventory/parts/:id/reserve — rechaza stock insuficiente', async () => {
    const res = await api.post(
      '/inventory/parts/p7/reserve',
      { cantidad: 1 },
      authHeaders(),
    );

    expect(res.status).toBe(400);
  });

  it('PATCH /inventory/parts/:id/toggle-active — desactiva pieza', async () => {
    const res = await api.patch(
      `/inventory/parts/${createdPartId}/toggle-active`,
      {},
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.estado).toBe('inactivo');
  });
});
