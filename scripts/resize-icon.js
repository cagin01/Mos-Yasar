const { Jimp, ResizeStrategy, intToRGBA, rgbaToInt } = require('jimp');
const path = require('path');

const CANVAS = 1024;
const ICON_CORNER_RADIUS_RATIO = 0.12;

function applyRoundedCorners(image, radius) {
  const { width, height } = image.bitmap;
  const radiusSquared = radius * radius;

  image.scan(0, 0, width, height, (x, y) => {
    const cornerX = x < radius ? radius : x >= width - radius ? width - radius - 1 : x;
    const cornerY = y < radius ? radius : y >= height - radius ? height - radius - 1 : y;
    const dx = x - cornerX;
    const dy = y - cornerY;

    if (dx * dx + dy * dy > radiusSquared) {
      const current = intToRGBA(image.getPixelColor(x, y));
      image.setPixelColor(rgbaToInt(current.r, current.g, current.b, 0), x, y);
    }
  });

  return image;
}

async function main() {
  const src = path.join(__dirname, '../assets/icon-original.png');
  const original = await Jimp.read(src);

  // icon.png — logo at 81% with transparent background (iOS + general use)
  const iconSize = Math.round(CANVAS * 0.81);
  const iconCanvas = new Jimp({ width: CANVAS, height: CANVAS, color: 0x00000000 });
  const iconLogo = applyRoundedCorners(
    original.clone().resize({ w: iconSize, h: iconSize, mode: ResizeStrategy.BILINEAR }),
    Math.round(iconSize * ICON_CORNER_RADIUS_RATIO),
  );
  const iconOffset = Math.round((CANVAS - iconSize) / 2);
  iconCanvas.composite(iconLogo, iconOffset, iconOffset);
  await iconCanvas.write(path.join(__dirname, '../assets/icon.png'));
  console.log(`icon.png: logo ${iconSize}px centred on ${CANVAS}px transparent canvas`);

  // adaptive-icon.png — logo at 67% for Android safe zone
  const adaptiveSize = Math.round(CANVAS * 0.67);
  const adaptiveCanvas = new Jimp({ width: CANVAS, height: CANVAS, color: 0x00000000 });
  const adaptiveLogo = original.clone().resize({ w: adaptiveSize, h: adaptiveSize, mode: ResizeStrategy.BILINEAR });
  const adaptiveOffset = Math.round((CANVAS - adaptiveSize) / 2);
  adaptiveCanvas.composite(adaptiveLogo, adaptiveOffset, adaptiveOffset);
  await adaptiveCanvas.write(path.join(__dirname, '../assets/adaptive-icon.png'));
  console.log(`adaptive-icon.png: logo ${adaptiveSize}px centred on ${CANVAS}px transparent canvas`);
}

main().catch(console.error);
