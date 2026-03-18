// auth/auth.js
// Responsabilidade: Validação de acesso por email (hash SHA-256) e persistência via localStorage

// Hash SHA-256 dos emails autorizados (nunca expõe o email em texto puro)
const ALLOWED_HASHES = [
  '5275e0a931a6997af5fd83ec913c7e4aaedd1f9878c269ae24fe6fa8aba27715',
];

const AUTH_STORAGE_KEY = 'gentilvoa_auth';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * Gera o hash SHA-256 de uma string usando a Web Crypto API
 */
async function hashEmail(email) {
  const normalized = email.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica se o email informado está na lista de autorizados
 */
async function validateEmail(email) {
  const hash = await hashEmail(email);
  return ALLOWED_HASHES.includes(hash);
}

/**
 * Salva a sessão no localStorage (para "manter logado")
 */
function saveSession(emailHash) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    hash: emailHash,
    timestamp: Date.now(),
  }));
}

/**
 * Verifica se existe uma sessão válida salva (com TTL de 7 dias)
 */
function isAuthenticated() {
  const session = localStorage.getItem(AUTH_STORAGE_KEY)
    || sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!session) return false;

  try {
    const { hash, timestamp } = JSON.parse(session);

    // Verifica se a sessão expirou
    if (timestamp && (Date.now() - timestamp) > SESSION_TTL_MS) {
      logout();
      return false;
    }

    return ALLOWED_HASHES.includes(hash);
  } catch {
    return false;
  }
}

/**
 * Remove a sessão (logout)
 */
function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Redireciona para login se não autenticado.
 * Chamar no início de páginas protegidas.
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
  }
}
