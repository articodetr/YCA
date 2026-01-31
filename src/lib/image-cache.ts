export function addCacheBuster(imageUrl: string | null | undefined, timestamp?: string | Date): string {
  if (!imageUrl) return '';

  try {
    const url = new URL(imageUrl);

    if (timestamp) {
      const ts = timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime();
      url.searchParams.set('v', ts.toString());
    } else {
      url.searchParams.set('v', Date.now().toString());
    }

    return url.toString();
  } catch (error) {
    console.warn('Invalid URL for cache busting:', imageUrl, error);
    return imageUrl;
  }
}
