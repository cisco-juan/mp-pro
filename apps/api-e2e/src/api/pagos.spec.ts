import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const api = axios.create({
  baseURL: `http://${host}:${port}/api`,
  validateStatus: () => true,
});

describe('Pagos API (e2e)', () => {
  let accessToken = '';

  beforeAll(async () => {
    const login = await api.post('/auth/login', {
      email: 'carmen.lopez@mppro.local',
      password: 'Admin123!',
    });
    expect(login.status).toBe(200);
    accessToken = login.data.accessToken;
  });

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  it('GET /payments — lista pagos', async () => {
    const res = await api.get('/payments', authHeaders());
    expect(res.status).toBe(200);
    expect(res.data.some((p: { id: string }) => p.id === 'pg1')).toBe(true);
  });

  it('POST /payments — registra pago parcial en factura emitida', async () => {
    const convert = await api.post(
      '/commercial-orders/oc2/convert-to-invoice',
      {},
      authHeaders(),
    );
    expect(convert.status).toBe(201);
    const facturaId = convert.data.id as string;

    const emit = await api.patch(
      `/commercial-orders/${facturaId}/estado`,
      { estado: 'emitida' },
      authHeaders(),
    );
    expect(emit.status).toBe(200);

    const res = await api.post(
      '/payments',
      {
        ordenComercialId: facturaId,
        monto: 100,
        metodo: 'transferencia',
        referencia: 'E2E-PAY-001',
      },
      authHeaders(),
    );
    expect(res.status).toBe(201);
    expect(res.data.monto).toBe(100);
  });
});
