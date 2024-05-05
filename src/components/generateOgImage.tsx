import satori, { type SatoriOptions } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import siteOgImage from './siteOgImage';
import type { Poll } from '@/models/types';

const fetchFonts = async () => {
  // Regular Font
  const fontFileRegular = await fetch(
    'http://localhost:4321/Roboto-Medium.ttf'
  );
  const fontRegular: ArrayBuffer = await fontFileRegular.arrayBuffer();

  return { fontRegular };
};

const { fontRegular } = await fetchFonts();
const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,

  fonts: [
    {
      name: 'Roboto',
      data: fontRegular,
      weight: 600,
      style: 'normal'
    }
  ]
};

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForSite(poll: Poll) {
  const svg = await satori(siteOgImage({ data: poll }), options);
  return svgBufferToPngBuffer(svg);
}
