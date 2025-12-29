#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const INPUT_DIR = path.resolve("./input");
const OUTPUT_DIR = path.resolve("./output");

// Path to LibreOffice
const LIBREOFFICE_PATH = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;

// Create output folder if not exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const files = fs
  .readdirSync(INPUT_DIR)
  .filter((f) => f.toLowerCase().endsWith(".pdf"));

if (files.length === 0) {
  console.log("⚠️ No PDF files found in input folder");
  process.exit(0);
}

async function convertPdfToWord(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const cmd = `${LIBREOFFICE_PATH} --headless --convert-to docx "${inputPath}" --outdir "${OUTPUT_DIR}"`;

  try {
    const { stdout, stderr } = await execAsync(cmd);
    console.log(`✅ PDF → Word: ${file}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (err) {
    console.error(`❌ Error converting ${file}:`, err.message);
  }
}

(async () => {
  for (const file of files) {
    await convertPdfToWord(file);
  }
  console.log("🎉 All PDFs have been converted to Word files");
})();
