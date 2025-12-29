#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { exec } from "child_process";

const INPUT_DIR = "./input";
const OUTPUT_DIR = "./output";

// Path to LibreOffice executable (Windows)
const LIBREOFFICE_PATH = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;

// Create output folder if not exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Get Word files
const files = fs
  .readdirSync(INPUT_DIR)
  .filter((f) => f.toLowerCase().endsWith(".docx"));

if (files.length === 0) {
  console.log("⚠️ No Word files found in input folder");
  process.exit(0);
}

// Process each Word file
for (const file of files) {
  const inputPath = path.join(INPUT_DIR, file);

  // LibreOffice command
  const cmd = `${LIBREOFFICE_PATH} --headless --convert-to pdf "${inputPath}" --outdir "${OUTPUT_DIR}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Error converting ${file}:`, err.message);
      console.error(stderr);
    } else {
      console.log(`✅ Word → PDF: ${file}`);
      console.log(stdout);
    }
  });
}
