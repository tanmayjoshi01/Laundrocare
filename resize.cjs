const sharp = require('sharp');
async function run() {
  try {
    await sharp('public/logo.png')
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile('public/logo-192.png');
    await sharp('public/logo.png')
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile('public/logo-512.png');
    console.log('done resizing icons');
  } catch (err) {
    console.error(err);
  }
}
run();
