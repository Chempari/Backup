const API_BASE = 'http://localhost:3977';

export function imageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/images/')) return `${API_BASE}${path}`;
  if (path.startsWith('data:')) return path;
  return path;
}

export function youtubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
    }
    if (u.hostname === 'youtu.be') {
      const v = u.pathname.replace(/^\/+/, '').split('/')[0];
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function vimeoEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('vimeo.com')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const v = parts[parts.length - 1];
      if (v && /^\d+$/.test(v)) return `https://player.vimeo.com/video/${v}`;
    }
    return null;
  } catch {
    return null;
  }
}

export function getEmbedUrl(url) {
  return youtubeEmbed(url) || vimeoEmbed(url) || url;
}
