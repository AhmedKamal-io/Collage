#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";

// فولدر الإدخال والإخراج
const INPUT_DIR = path.resolve("./input");
const OUTPUT_DIR = path.resolve("./output");

// prefix اللي لو السطر بيبدأ بيه هيتحول
const PREFIX = process.argv[2];

if (!PREFIX) {
  console.log("⚠️ Please provide the line prefix to replace as argument");
  process.exit(0);
}

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// جمع ملفات Word
const files = fs
  .readdirSync(INPUT_DIR)
  .filter((f) => f.toLowerCase().endsWith(".docx"));

if (files.length === 0) {
  console.log("⚠️ No Word files found in input folder");
  process.exit(0);
}

async function processFile(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const outputPath = path.join(OUTPUT_DIR, file);

  const content = fs.readFileSync(inputPath);

  // استخراج النص الخام
  const { value: text } = await mammoth.extractRawText({ buffer: content });
  const lines = text.split("\n");

  // إنشاء مستند جديد مع استبدال السطر وتهيئة الخط
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: lines.map((line) => {
          const text = line.trim().startsWith(PREFIX)
            ? "==========================="
            : line;
          return new Paragraph({
            children: [
              new TextRun({
                text,
                font: "Noto Sans",
                size: 28, // docx يستخدم نصف النقطة، ف28 = 14pt
              }),
            ],
          });
        }),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Processed: ${file}`);
}

(async () => {
  for (const file of files) {
    await processFile(file);
  }
  console.log("🎉 All done!");
})();
