// ─── API BASE URL ──────────────────────────────────────────────────────────────
// This is the KEY fix for phone/Render compatibility.
// - On Render: REACT_APP_API_URL is set to your backend URL
// - In development: falls back to localhost:5000
// - If frontend is served by same Express server: uses relative URL (empty string)

function getBaseUrl() {
  // Explicitly set via env var (Vercel/Netlify/Render)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }
  // Development: use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  // Production without env var: assume same origin (Express serves frontend)
  return '';
}

const BASE_URL = getBaseUrl();

// ─── FETCH WRAPPER ─────────────────────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('सर्वर से कनेक्ट नहीं हो पाया। Internet चेक करें।');
    }
    throw err;
  }
}

// ─── API METHODS ───────────────────────────────────────────────────────────────
export const api = {
  // Health
  health: () => apiFetch('/api/health'),

  // Drivers
  registerDriver: (data) => apiFetch('/api/drivers', { method: 'POST', body: data }),
  getDrivers: () => apiFetch('/api/drivers'),
  getDriver: (id) => apiFetch(`/api/drivers/${id}`),
  toggleAvailability: (id, available, lat, lng) =>
    apiFetch(`/api/drivers/${id}/availability`, { method: 'PATCH', body: { available, lat, lng } }),
  updateLocation: (id, lat, lng) =>
    apiFetch(`/api/drivers/${id}/location`, { method: 'PATCH', body: { lat, lng } }),
  getNearbyVehicles: (lat, lng, radius = 50) =>
    apiFetch(`/api/drivers/nearby/search?lat=${lat}&lng=${lng}&radius=${radius}`),

  // Bookings
  createBooking: (data) => apiFetch('/api/bookings', { method: 'POST', body: data }),
  getBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/api/bookings${q ? '?' + q : ''}`);
  },
  getBooking: (id) => apiFetch(`/api/bookings/${id}`),
  updateBookingStatus: (id, status, driverId) =>
    apiFetch(`/api/bookings/${id}/status`, { method: 'PATCH', body: { status, driverId } }),
  getStats: () => apiFetch('/api/bookings/admin/stats'),
};

// ─── GEOLOCATION ───────────────────────────────────────────────────────────────
export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS इस device पर उपलब्ध नहीं है'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        // Fallback to Lucknow center if GPS denied
        console.warn('GPS denied, using fallback location');
        resolve({ lat: 26.8467, lng: 80.9462, isFallback: true });
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
export const GOODS_TYPES = [
  { value: 'Saman',      label: '📦 सामान',      desc: 'General goods' },
  { value: 'Kheti',      label: '🌾 खेती',        desc: 'Agricultural produce' },
  { value: 'Pashu',      label: '🐄 पशु',          desc: 'Livestock' },
  { value: 'Passenger',  label: '👤 सवारी',        desc: 'Passenger transport' },
  { value: 'Nirman',     label: '🧱 निर्माण',       desc: 'Construction material' },
  { value: 'Other',      label: '🔧 अन्य',          desc: 'Other' }
];

export const VEHICLE_TYPES = [
  'Tractor', 'Mini Truck', 'Pickup Van', 'Tempo', 'Bullock Cart', 'Auto', 'Truck'
];

export const VEHICLE_EMOJI = {
  'Tractor': '🚜', 'Mini Truck': '🚛', 'Pickup Van': '🛻',
  'Tempo': '🚐', 'Bullock Cart': '🐂', 'Auto': '🛺', 'Truck': '🚚'
};

export function calcFare(distanceKm) {
  return Math.round(distanceKm * 40 + 100);
}
