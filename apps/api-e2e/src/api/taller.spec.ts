import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Taller / órdenes de trabajo API (e2e)', () => {
  let accessToken = '';
  let createdOrderId = '';
  let partLineId = '';

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

  it('GET /work-orders — lista órdenes sembradas', async () => {
    const res = await api.get('/work-orders', authHeaders());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.some((o: { id: string }) => o.id === 'o1')).toBe(true);
    const o1 = res.data.find((o: { id: string }) => o.id === 'o1');
    expect(o1.estado).toBe('en_progreso');
    expect(o1.piezasUsadas.length).toBeGreaterThan(0);
  });

  it('GET /work-orders?clientId=c1 — filtra por cliente', async () => {
    const res = await api.get('/work-orders?clientId=c1', authHeaders());

    expect(res.status).toBe(200);
    expect(res.data.every((o: { clienteId: string }) => o.clienteId === 'c1')).toBe(true);
  });

  it('GET /work-orders/o1 — detalle orden', async () => {
    const res = await api.get('/work-orders/o1', authHeaders());

    expect(res.status).toBe(200);
    expect(res.data.numero).toBe('OT-2026-0142');
    expect(res.data.checklist.length).toBeGreaterThan(0);
  });

  it('POST /work-orders — crea orden de trabajo', async () => {
    const res = await api.post(
      '/work-orders',
      {
        clienteId: 'c1',
        vehiculoId: 'v1',
        usuarioId: 'u1',
        tipo: 'mantenimiento',
        descripcion: 'Orden E2E test',
        fechaEntrada: '2026-05-20',
        fechaEstimada: '2026-05-22',
      },
      authHeaders(),
    );

    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.estado).toBe('pendiente');
    expect(res.data.checklist.length).toBe(6);
    createdOrderId = res.data.id;
  });

  it('PATCH /work-orders/:id — actualiza orden', async () => {
    const res = await api.patch(
      `/work-orders/${createdOrderId}`,
      { descripcion: 'Orden E2E actualizada' },
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.descripcion).toBe('Orden E2E actualizada');
  });

  it('PATCH /work-orders/:id/estado — cambia estado', async () => {
    const res = await api.patch(
      `/work-orders/${createdOrderId}/estado`,
      { estado: 'en_progreso', nota: 'Inicio en e2e' },
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.estado).toBe('en_progreso');
    expect(res.data.timeline.some((t: { nota: string }) => t.nota === 'Inicio en e2e')).toBe(
      true,
    );
  });

  it('PATCH /work-orders/:id/checklist/0/toggle — alterna checklist', async () => {
    const res = await api.patch(
      `/work-orders/${createdOrderId}/checklist/0/toggle`,
      {},
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.checklist[0].completado).toBe(true);
  });

  it('POST /work-orders/:id/parts — añade pieza', async () => {
    const res = await api.post(
      `/work-orders/${createdOrderId}/parts`,
      { piezaId: 'p1', cantidad: 1, precioUnitario: 12.5 },
      authHeaders(),
    );

    expect(res.status).toBe(201);
    expect(res.data.piezasUsadas.length).toBe(1);
    expect(res.data.totalEstimado).toBe(12.5);
    partLineId = res.data.piezasUsadas[0].lineId;
  });

  it('PATCH /work-orders/:id/assign — asigna mecánico', async () => {
    const res = await api.patch(
      `/work-orders/${createdOrderId}/assign`,
      { usuarioId: 'u2' },
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.usuarioId).toBe('u2');
  });

  it('DELETE /work-orders/:id/parts/:partLineId — quita pieza', async () => {
    const res = await api.delete(
      `/work-orders/${createdOrderId}/parts/${partLineId}`,
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.piezasUsadas.length).toBe(0);
    expect(res.data.totalEstimado).toBe(0);
  });

  it('PATCH /work-orders/:id/link-commercial-order — vincula cotización', async () => {
    const cotizacion = await api.post(
      '/commercial-orders/from-work-order',
      { ordenTrabajoId: createdOrderId },
      authHeaders(),
    );
    expect(cotizacion.status).toBe(201);

    const res = await api.patch(
      `/work-orders/${createdOrderId}/link-commercial-order`,
      { ordenComercialId: cotizacion.data.id },
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.ordenComercialId).toBe(cotizacion.data.id);
  });
});
