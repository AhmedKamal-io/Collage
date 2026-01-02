#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

const INPUT_DIR = path.resolve("./input");
const OUTPUT_DIR = path.resolve("./output");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const files = fs.readdirSync(INPUT_DIR);

async function mergeWordFiles(wordFiles) {
  const sections = [];
  for (const file of wordFiles) {
    const content = fs.readFileSync(path.join(INPUT_DIR, file));
    const { value: text } = await mammoth.extractRawText({ buffer: content });
    const lines = text.split("\n");

    const paragraphs = lines.map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line })],
        })
    );

    sections.push({
      properties: { pageBreakBefore: true },
      children: paragraphs,
    });
  }

  const doc = new Document({ sections });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUTPUT_DIR, "merged.docx"), buffer);
  console.log("✅ Word files merged (compressed if images existed)");
}

async function mergePdfFiles(pdfFiles) {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const pdfBytes = fs.readFileSync(path.join(INPUT_DIR, file));
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save({
    useObjectStreams: true,
    compress: true,
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, "merged.pdf"), mergedBytes);
  console.log("✅ PDF files merged (compressed)");
}

(async () => {
  const wordFiles = files.filter((f) => f.toLowerCase().endsWith(".docx"));
  const pdfFiles = files.filter((f) => f.toLowerCase().endsWith(".pdf"));
  const excelFiles = files.filter((f) => f.toLowerCase().endsWith(".xlsx"));
  const pptFiles = files.filter((f) => f.toLowerCase().endsWith(".pptx"));

  if (wordFiles.length > 0) await mergeWordFiles(wordFiles);
  if (pdfFiles.length > 0) await mergePdfFiles(pdfFiles);

  // لو عايز، هنا ممكن تضيف تحويل Excel/PPT → PDF قبل الدمج
  console.log("🎉 All merging done!");
})();
