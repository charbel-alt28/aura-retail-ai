/**
 * Session Fingerprinting
 * 
 * Generates a browser fingerprint from stable device characteristics.
 * If the fingerprint changes mid-session, the user is auto-logged out
 * to prevent session hijacking.
 */

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('fingerprint', 4, 17);
    return canvas.toDataURL().slice(-50);
  } catch {
    return 'canvas-error';
  }
}

export function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency?.toString() ?? 'unknown',
    screen.width + 'x' + screen.height,
    screen.colorDepth?.toString() ?? 'unknown',
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform ?? 'unknown',
    getCanvasFingerprint(),
  ];
  
  // Simple hash
  const raw = components.join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'fp_' + Math.abs(hash).toString(36);
}

const FINGERPRINT_KEY = 'session_fingerprint';

export function storeFingerprint(): string {
  const fp = generateFingerprint();
  sessionStorage.setItem(FINGERPRINT_KEY, fp);
  return fp;
}

export function validateFingerprint(): boolean {
  const stored = sessionStorage.getItem(FINGERPRINT_KEY);
  if (!stored) return true; // First time, no stored fingerprint yet
  const current = generateFingerprint();
  return stored === current;
}

export function clearFingerprint(): void {
  sessionStorage.removeItem(FINGERPRINT_KEY);
}
