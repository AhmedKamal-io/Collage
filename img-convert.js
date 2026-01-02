#!/usr/bin/env node

import fs from "fs";
import path from "path";
import sharp from "sharp";

const INPUT_DIR = path.resolve("./input");
const OUTPUT_DIR = path.resolve("./output");

const FORMAT = process.argv[2]; // jpg | png | webp | avif

if (!FORMAT) {
  console.log("Usage:");
  console.log("  node img-batch-convert.js <format>");
  console.log("Example:");
  console.log("  node img-batch-convert.js jpg");
  process.exit(0);
}

const format = FORMAT.toLowerCase();

if (!["jpg", "jpeg", "png", "webp", "avif"].includes(format)) {
  console.error("❌ Unsupported format");
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const files = fs
  .readdirSync(INPUT_DIR)
  .filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));

if (files.length === 0) {
  console.log("⚠️ No images found in input folder");
  process.exit(0);
}

async function convertImage(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const name = path.parse(file).name;
  const outputPath = path.join(OUTPUT_DIR, `${name}.${format}`);

  let image = sharp(inputPath);

  switch (format) {
    case "jpg":
    case "jpeg":
      image = image.jpeg({ quality: 85 });
      break;
    case "png":
      image = image.png();
      break;
    case "webp":
      image = image.webp({ quality: 85 });
      break;
    case "avif":
      image = image.avif({ quality: 50 });
      break;
  }

  await image.toFile(outputPath);
  console.log(`✅ ${file} → ${name}.${format}`);
}

(async () => {
  for (const file of files) {
    await convertImage(file);
  }
  console.log("🎉 All images converted successfully");
})();
