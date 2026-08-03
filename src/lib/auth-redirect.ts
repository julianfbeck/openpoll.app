const CALLBACK_BASE = 'http://openpoll.local';

export function getSafeCallbackURL(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  try {
    const parsed = new URL(value, CALLBACK_BASE);
    if (parsed.origin !== CALLBACK_BASE) {
      return '/';
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}

export function getSignInURL(url: URL): string {
  const callbackURL = getSafeCallbackURL(`${url.pathname}${url.search}`);
  return `/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`;
}
