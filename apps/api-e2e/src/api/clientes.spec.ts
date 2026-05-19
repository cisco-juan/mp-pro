import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Clientes y vehículos API (e2e)', () => {
  let accessToken = '';
  let createdClientId = '';
  let createdVehicleId = '';

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

  it('GET /clients — lista clientes sembrados', async () => {
    const res = await api.get('/clients', authHeaders());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.some((c: { id: string }) => c.id === 'c1')).toBe(true);
    expect(res.data.find((c: { id: string }) => c.id === 'c1')?.vehiculosCount).toBe(2);
  });

  it('GET /vehicles — lista vehículos', async () => {
    const res = await api.get('/vehicles', authHeaders());

    expect(res.status).toBe(200);
    expect(res.data.some((v: { matricula: string }) => v.matricula === '1234 ABC')).toBe(
      true,
    );
  });

  it('GET /vehicles?clientId=c1 — filtra por cliente', async () => {
    const res = await api.get('/vehicles?clientId=c1', authHeaders());

    expect(res.status).toBe(200);
    expect(res.data.length).toBe(2);
    expect(res.data.every((v: { clienteId: string }) => v.clienteId === 'c1')).toBe(true);
  });

  it('POST /clients — crea cliente con vehículo', async () => {
    const res = await api.post(
      '/clients',
      {
        nombre: 'Cliente E2E Test',
        email: `e2e.cliente.${Date.now()}@test.local`,
        telefono: '+34 699 000 111',
        registrarVehiculo: true,
        vehiculo: {
          matricula: `E2E ${Date.now()}`,
          marca: 'Toyota',
          modelo: 'Proace',
          anio: 2024,
          color: 'Negro',
          kilometraje: 1000,
          proximoMantenimiento: '2026-12-01',
        },
      },
      authHeaders(),
    );

    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    expect(res.data.vehiculosCount).toBe(1);
    createdClientId = res.data.id;
  });

  it('GET /clients/:id — detalle cliente creado', async () => {
    const res = await api.get(`/clients/${createdClientId}`, authHeaders());

    expect(res.status).toBe(200);
    expect(res.data.nombre).toBe('Cliente E2E Test');
  });

  it('PATCH /clients/:id — actualiza cliente', async () => {
    const res = await api.patch(
      `/clients/${createdClientId}`,
      { notas: 'Actualizado en e2e' },
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.notas).toBe('Actualizado en e2e');
  });

  it('POST /vehicles — crea vehículo adicional', async () => {
    const res = await api.post(
      '/vehicles',
      {
        clientId: createdClientId,
        matricula: `E2E2 ${Date.now()}`,
        marca: 'Fiat',
        modelo: 'Ducato',
        anio: 2023,
        proximoMantenimiento: '2026-09-15',
      },
      authHeaders(),
    );

    expect(res.status).toBe(201);
    expect(res.data.clienteId).toBe(createdClientId);
    createdVehicleId = res.data.id;
  });

  it('PATCH /vehicles/:id/toggle-active — desactiva vehículo', async () => {
    const res = await api.patch(
      `/vehicles/${createdVehicleId}/toggle-active`,
      {},
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.estado).toBe('inactivo');
  });

  it('PATCH /clients/:id/toggle-active — desactiva cliente', async () => {
    const res = await api.patch(
      `/clients/${createdClientId}/toggle-active`,
      {},
      authHeaders(),
    );

    expect(res.status).toBe(200);
    expect(res.data.estado).toBe('inactivo');
  });
});
