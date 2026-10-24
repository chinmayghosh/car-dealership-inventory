import { ApiError, apiRequest, tokenStore } from './client';

const jsonResponse = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('apiRequest', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends JSON and returns the parsed body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: '1' }));

    const result = await apiRequest('/api/vehicles', { method: 'POST', body: { make: 'BMW' } });

    expect(result).toEqual({ id: '1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/vehicles');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ make: 'BMW' }));
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('attaches the stored token as a Bearer header', async () => {
    tokenStore.set('abc.def.ghi');
    fetchMock.mockResolvedValue(jsonResponse(200, []));

    await apiRequest('/api/vehicles');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc.def.ghi');
  });

  it('omits the Authorization header when logged out', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, []));

    await apiRequest('/api/vehicles');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('returns undefined for 204 No Content', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiRequest('/api/vehicles/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws an ApiError carrying the server message and field errors', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        message: 'Validation failed',
        errors: [{ field: 'price', message: 'Price must be greater than 0' }],
      }),
    );

    const error = await apiRequest('/api/vehicles', { method: 'POST', body: {} }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Validation failed');
    expect(error.fieldErrors).toEqual({ price: 'Price must be greater than 0' });
  });

  it('clears the token and notifies listeners when the session has expired (401)', async () => {
    tokenStore.set('expired');
    const onExpired = vi.fn();
    window.addEventListener('auth:expired', onExpired);
    fetchMock.mockResolvedValue(jsonResponse(401, { message: 'Invalid or expired token' }));

    await expect(apiRequest('/api/vehicles')).rejects.toBeInstanceOf(ApiError);

    expect(tokenStore.get()).toBeNull();
    expect(onExpired).toHaveBeenCalled();
    window.removeEventListener('auth:expired', onExpired);
  });

  it('turns a network failure into a friendly ApiError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await apiRequest('/api/vehicles').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toMatch(/could not reach the server/i);
  });
});
