const PLATFORMS = {
  facebook: { label: 'Facebook', domain: 'facebook.com' },
  instagram: { label: 'Instagram', domain: 'instagram.com' },
  linkedin: { label: 'LinkedIn', domain: 'linkedin.com' },
  github: { label: 'GitHub', domain: 'github.com' },
  whatsapp: { label: 'WhatsApp', domain: 'whats.me' }
};

export function getPlatformKey(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [key, cfg] of Object.entries(PLATFORMS)) {
      if (host === cfg.domain || host.endsWith('.' + cfg.domain)) return key;
    }
    return null;
  } catch {
    return null;
  }
}

export function validateSocialUrl(platform, url) {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  const cfg = PLATFORMS[platform];
  if (!cfg) return 'Plataforma no soportada';
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return 'URL invalida';
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'URL invalida';
  const host = parsed.hostname.toLowerCase();
  if (host !== cfg.domain && !host.endsWith('.' + cfg.domain)) {
    return `La URL debe pertenecer a ${cfg.domain}`;
  }
  return null;
}

export function normalizeRedes(input) {
  const out = { facebook: '', instagram: '', linkedin: '', github: '', whatsapp: '' };
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  for (const key of Object.keys(out)) {
    if (typeof input[key] === 'string') out[key] = input[key].trim();
  }
  return out;
}

export { PLATFORMS };
