#!/usr/bin/env node

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

// ================== الإعدادات ==================
const INPUT_DIR = "./input";
const OUTPUT_DIR = "./output";

const pageWidth = 595; // A4
const pageHeight = 842;
const margin = 20;

// إعدادات الضغط (ممتازة للجودة)
const MAX_IMAGE_SIZE = 2000;
const IMAGE_QUALITY = 80;
// ===============================================

// ---------- ضغط الصورة ----------
async function compressImage(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({
      width: MAX_IMAGE_SIZE,
      height: MAX_IMAGE_SIZE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: IMAGE_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();
}

// ---------- إنشاء PDF من فولدر ----------
async function createPdfFromFolder(folderPath, pdfPath) {
  const pdf = await PDFDocument.create();

  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log(`⚠️ لا توجد صور في ${folderPath}`);
    return;
  }

  for (const file of files) {
    const imgPath = path.join(folderPath, file);
    const originalBytes = fs.readFileSync(imgPath);
    const compressedBytes = await compressImage(originalBytes);

    const image = await pdf.embedJpg(compressedBytes);

    const page = pdf.addPage([pageWidth, pageHeight]);

    const scale = Math.min(
      (pageWidth - margin * 2) / image.width,
      (pageHeight - margin * 2) / image.height
    );

    const width = image.width * scale;
    const height = image.height * scale;

    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    page.drawImage(image, { x, y, width, height });
  }

  fs.writeFileSync(pdfPath, await pdf.save());
}

// ---------- التشغيل ----------
async function run() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.log("❌ فولدر input غير موجود");
    return;
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const folders = fs
    .readdirSync(INPUT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  if (folders.length === 0) {
    console.log("⚠️ مفيش فولدرات جوه input");
    return;
  }

  for (const folder of folders) {
    const folderPath = path.join(INPUT_DIR, folder.name);
    const outputPdf = path.join(OUTPUT_DIR, `${folder.name}.pdf`);

    console.log(`📁 Processing: ${folder.name}`);
    await createPdfFromFolder(folderPath, outputPdf);
    console.log(`✅ Created: ${outputPdf}`);
  }

  console.log("🎉 تم إنشاء كل ملفات الـ PDF بنجاح");
}

run();
