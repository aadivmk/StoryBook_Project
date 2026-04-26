// ============================================================
// frontend/js/api.js
// Utility module for all API calls to the backend.
// No tokens — user object stored directly in localStorage.
// ============================================================

const API = (() => {
  const BASE = 'http://localhost:5000/api';

  // Standard headers for every request
  const headers = () => ({
    'Content-Type': 'application/json'
  });

  // Core request helper — throws on non-2xx so callers can catch
  const request = async (method, endpoint, body = null) => {
    const opts = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);

    const res  = await fetch(BASE + endpoint, opts);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  return {
    get:    (ep)    => request('GET',    ep),
    post:   (ep, b) => request('POST',   ep, b),
    put:    (ep, b) => request('PUT',    ep, b),
    delete: (ep)    => request('DELETE', ep),
    BASE
  };
})();
