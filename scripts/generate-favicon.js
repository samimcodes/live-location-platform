/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Create 32x32 icon
const size = 32;
const png = new PNG({ width: size, height: size });

// Color helper
function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const idx = (size * y + x) << 2;
  // Blend with existing pixel if alpha < 255
  if (a < 255) {
    const bgA = png.data[idx + 3] / 255;
    const fgA = a / 255;
    const outA = fgA + bgA * (1 - fgA);
    if (outA > 0) {
      png.data[idx] = Math.round((r * fgA + png.data[idx] * bgA * (1 - fgA)) / outA);
      png.data[idx + 1] = Math.round((g * fgA + png.data[idx + 1] * bgA * (1 - fgA)) / outA);
      png.data[idx + 2] = Math.round((b * fgA + png.data[idx + 2] * bgA * (1 - fgA)) / outA);
      png.data[idx + 3] = Math.round(outA * 255);
    }
  } else {
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  }
}

// 1. Draw rounded squircle base with gradient from Indigo (79, 70, 229) to Violet (139, 92, 246)
const radius = 9;
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    // Check rounded corners
    let inside = true;
    if (x < radius && y < radius) {
      inside = Math.hypot(x - radius, y - radius) <= radius;
    } else if (x >= size - radius && y < radius) {
      inside = Math.hypot(x - (size - radius - 1), y - radius) <= radius;
    } else if (x < radius && y >= size - radius) {
      inside = Math.hypot(x - radius, y - (size - radius - 1)) <= radius;
    } else if (x >= size - radius && y >= size - radius) {
      inside = Math.hypot(x - (size - radius - 1), y - (size - radius - 1)) <= radius;
    }

    if (inside) {
      // Gradient factor (diagonal)
      const t = (x + (size - y)) / (size * 2);
      const r = Math.round(79 + (139 - 79) * t);
      const g = Math.round(70 + (92 - 70) * t);
      const b = Math.round(229 + (246 - 229) * t);
      setPixel(x, y, r, g, b, 255);
    } else {
      setPixel(x, y, 0, 0, 0, 0); // transparent
    }
  }
}

// 2. Draw Location Pin (white)
const centerX = 16;
const headCenterY = 11.5;
const headRadius = 7.5;
const pointY = 27;

for (let y = 3; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const distToHead = Math.hypot(x - centerX, y - headCenterY);
    let inPin = false;

    // Head circle
    if (distToHead <= headRadius && y <= headCenterY) {
      inPin = true;
    } else if (y > headCenterY && y <= pointY) {
      // Triangle body towards point
      const progress = (y - headCenterY) / (pointY - headCenterY);
      const halfWidth = headRadius * (1 - progress * 0.9);
      if (Math.abs(x - centerX) <= halfWidth) {
        inPin = true;
      }
    }

    if (inPin) {
      // Inner hole cutout
      const distToHole = Math.hypot(x - centerX, y - headCenterY);
      if (distToHole > 3.2) {
        setPixel(x, y, 255, 255, 255, 245);
      } else {
        // Inner Indigo dot
        setPixel(x, y, 79, 70, 229, 255);
      }
    }
  }
}

// 3. Draw Orbit Ring dots (translucent white)
const orbitRx = 13.5;
const orbitRy = 5.8;
const orbitAngle = -26 * (Math.PI / 180);
const cosA = Math.cos(orbitAngle);
const sinA = Math.sin(orbitAngle);

for (let a = 0; a < Math.PI * 2; a += 0.08) {
  const ex = orbitRx * Math.cos(a);
  const ey = orbitRy * Math.sin(a);
  const rx = centerX + (ex * cosA - ey * sinA);
  const ry = 16 + (ex * sinA + ey * cosA);
  const px = Math.round(rx);
  const py = Math.round(ry);
  if (px >= 0 && px < size && py >= 0 && py < size) {
    // Check if not inside pin body
    const inPin = Math.hypot(px - centerX, py - headCenterY) <= headRadius;
    if (!inPin || py < headCenterY - 3 || py > headCenterY + 4) {
      setPixel(px, py, 255, 255, 255, 140);
    }
  }
}

// 4. Draw Active Cyan Satellite Node
const satX = 26;
const satY = 11;
for (let dy = -1; dy <= 1; dy++) {
  for (let dx = -1; dx <= 1; dx++) {
    if (Math.hypot(dx, dy) <= 1.6) {
      setPixel(satX + dx, satY + dy, 56, 189, 248, 255); // Cyan #38BDF8
    }
  }
}

// Convert PNG to buffer
const pngBuffer = PNG.sync.write(png);

// Construct ICO format wrapping PNG
// Header: 6 bytes
// IconDirEntry: 16 bytes
// Image data: pngBuffer
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
icoHeader.writeUInt16LE(1, 4); // 1 image

const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(size, 0); // width
dirEntry.writeUInt8(size, 1); // height
dirEntry.writeUInt8(0, 2);    // color count
dirEntry.writeUInt8(0, 3);    // reserved
dirEntry.writeUInt16LE(1, 4); // color planes
dirEntry.writeUInt16LE(32, 6);// bpp
dirEntry.writeUInt32LE(pngBuffer.length, 8); // image size
dirEntry.writeUInt32LE(22, 12); // image offset (6 + 16 = 22)

const icoBuffer = Buffer.concat([icoHeader, dirEntry, pngBuffer]);

// Write to files
fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoBuffer);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.png'), pngBuffer);

console.log('Successfully generated LocaLink favicon.ico & favicon.png!');
