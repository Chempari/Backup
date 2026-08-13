const DOMINIOS = {
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  linkedin: ['linkedin.com', 'lnkd.in'],
  github: ['github.com'],
  whatsapp: ['wa.me', 'api.whatsapp.com', 'whatsapp.com']
};

function isValidUrl(string) {
  try {
    const u = new URL(string);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function domainMatches(hostname, candidates) {
  return candidates.some((d) => hostname === d || hostname.endsWith('.' + d));
}

exports.validateSocialUrl = (platform, url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return null;

  if (!DOMINIOS[platform]) return 'Plataforma no soportada';

  const trimmed = url.trim();
  if (!isValidUrl(trimmed)) return 'URL invalida';

  const host = getHostname(trimmed);
  if (!domainMatches(host, DOMINIOS[platform])) {
    return `La URL no pertenece a ${platform}`;
  }
  return null;
};

exports.normalizeRedes = (input) => {
  const out = { facebook: '', instagram: '', linkedin: '', github: '', whatsapp: '' };
  if (!input || typeof input !== 'object') return out;
  for (const key of Object.keys(out)) {
    if (typeof input[key] === 'string') out[key] = input[key].trim();
  }
  return out;
};

exports.PLATFORMS = Object.keys(DOMINIOS);
