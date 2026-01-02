#!/usr/bin/env node

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { trace } from "potrace";

const INPUT_DIR = path.resolve("./input");
const OUTPUT_DIR = path.resolve("./output");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const files = fs
  .readdirSync(INPUT_DIR)
  .filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

if (files.length === 0) {
  console.log("⚠️ No images found in input folder");
  process.exit(0);
}

async function convertToSvg(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const name = path.parse(file).name;
  const outputPath = path.join(OUTPUT_DIR, `${name}.svg`);

  // نحول الصورة لأبيض وأسود علشان النتيجة تبقى نضيفة
  const buffer = await sharp(inputPath)
    .resize(1200, 1200, { fit: "inside" })
    .grayscale()
    .threshold(180)
    .toBuffer();

  return new Promise((resolve, reject) => {
    trace(buffer, { turdSize: 100 }, (err, svg) => {
      if (err) return reject(err);
      fs.writeFileSync(outputPath, svg);
      console.log(`✅ ${file} → ${name}.svg`);
      resolve();
    });
  });
}

(async () => {
  for (const file of files) {
    await convertToSvg(file);
  }
  console.log(" All images converted to SVG");
})();
