export default function bunnyLoader({ src, width, quality }) {
  const url = new URL(`https://your-zone.b-cdn.net${src}`);
  
  // Bunny Optimizer Parameters
  url.searchParams.set('width', width.toString());
  url.searchParams.set('quality', (quality || 75).toString());
  url.searchParams.set('auto', 'webp'); // Automatically convert to WebP/AVIF
  
  return url.href;
}