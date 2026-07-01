const sharp = require('sharp');
const fs = require('fs');

async function createFavicons() {
  const input = 'images/s4s.png';

  try {
    // Create 16x16 favicon.ico (smallest size for browser tabs)
    await sharp(input)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile('favicon-16x16.png');

    // Create 32x32 favicon
    await sharp(input)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile('favicon-32x32.png');

    // Create 180x180 Apple Touch Icon
    await sharp(input)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile('apple-touch-icon.png');

    // Create 192x192 Android icon
    await sharp(input)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile('android-chrome-192x192.png');

    // Create 512x512 Android icon
    await sharp(input)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile('android-chrome-512x512.png');

    console.log('✓ Created favicon-16x16.png');
    console.log('✓ Created favicon-32x32.png');
    console.log('✓ Created apple-touch-icon.png');
    console.log('✓ Created android-chrome-192x192.png');
    console.log('✓ Created android-chrome-512x512.png');
    console.log('\nFavicons created successfully!');

  } catch (error) {
    console.error('Error creating favicons:', error);
  }
}

createFavicons();
