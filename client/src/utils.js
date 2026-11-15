// Convert any YouTube link (watch?v=, youtu.be/, embed/, with &t=) to an embeddable URL.
// Returns null for non-YouTube links (those are played with a <video> tag instead).
export function toEmbedUrl(url = '') {
  try {
    const u = new URL(url);
    let id = null;
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    else if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2];
      else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2];
      else id = u.searchParams.get('v');
    }
    if (!id) return null;
    const t = u.searchParams.get('t') || u.searchParams.get('start');
    const start = t ? parseInt(t, 10) : 0;
    return `https://www.youtube.com/embed/${id}?rel=0${start ? `&start=${start}` : ''}`;
  } catch {
    return null;
  }
}

export const fallbackImage = () => '/images/courses/default.svg';

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Swap a broken image for a placeholder once (guard prevents an error loop)
export const onImgError = (seed) => (e) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = '1';
  img.src = fallbackImage(seed);
};
