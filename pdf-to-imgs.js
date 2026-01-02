#!/usr/bin/env node

import fs from "fs";
import path from "path";
import pdf from "pdf-poppler";

const INPUT_DIR = path.resolve("./input");
const OUTPUT_DIR = path.resolve("./output");

const SLIDES_ARG = process.argv[2]; // مثال: 1-5,7,9

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const files = fs
  .readdirSync(INPUT_DIR)
  .filter((f) => f.toLowerCase().endsWith(".pdf"));

if (files.length === 0) {
  console.log("No PDF files found in input folder");
  process.exit(0);
}

/**
 * تحويل باراميتر السلايدات لمصفوفة أرقام
 */
function parsePages(input) {
  if (!input) return null;

  const pages = new Set();

  input.split(",").forEach((part) => {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) pages.add(i);
    } else {
      pages.add(Number(part));
    }
  });

  return [...pages].sort((a, b) => a - b);
}

const PAGES = parsePages(SLIDES_ARG);

async function convertPdf(pdfFile) {
  const pdfPath = path.join(INPUT_DIR, pdfFile);
  const pdfName = path.parse(pdfFile).name;

  const pdfOutputDir = path.join(OUTPUT_DIR, pdfName);
  if (!fs.existsSync(pdfOutputDir)) {
    fs.mkdirSync(pdfOutputDir);
  }

  const options = {
    format: "jpeg",
    out_dir: pdfOutputDir,
    out_prefix: pdfName,
    page: PAGES, // null = كل الصفحات
    dpi: 200,
  };

  try {
    await pdf.convert(pdfPath, options);

    const images = fs
      .readdirSync(pdfOutputDir)
      .filter((f) => f.endsWith(".jpg") || f.endsWith(".jpeg"))
      .sort();

    images.forEach((img, index) => {
      const pageNumber = PAGES ? PAGES[index] : index + 1;
      const newName = `${pdfName}_page_${String(pageNumber).padStart(
        2,
        "0"
      )}.jpg`;

      fs.renameSync(
        path.join(pdfOutputDir, img),
        path.join(pdfOutputDir, newName)
      );
    });

    console.log(`Converted: ${pdfFile}`);
  } catch (err) {
    console.error(`Error converting ${pdfFile}: ${err.message}`);
  }
}

(async () => {
  for (const file of files) {
    await convertPdf(file);
  }
  console.log("All PDFs converted successfully");
})();
