import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { saveAsTextFile } from "../services/textService.js";
import { appendToCsv } from "../services/csvService.js";
import { appendToGoogleSheet } from "../services/googleSheetService.js";

export const processInstantOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = path.resolve(`src/uploads/${req.file.filename}`);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    console.log("Processing OCR for:", imagePath);

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const prompt = `
You are an OCR transcription engine, not a summarizer.

Your task:
- Read every visible printed character from the book page image.
- Reproduce it exactly as printed.
- Do not interpret, summarize, describe, explain, or add any extra information.
- If a word or character is unclear, write “[UNREADABLE]” instead of guessing.
- Preserve all punctuation, capitalization, and line breaks.
- Preserve all line breaks and paragraph spacing.
- Do NOT invent or include page numbers unless they are visibly printed in the image.
- Do NOT write phrases like “The text says…” — just output the raw text.
- Output only the transcribed text, nothing else.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "minicpm-v:8b",
        prompt,
        images: [imageBase64],
        stream: false,
      }),
    });

    const data = await response.json();
    const extractedText = data?.response?.trim() || "No text found";

    // Save files and update Sheet
    const textPath = await saveAsTextFile(req.file.filename, extractedText);
    const csvPath = await appendToCsv(req.file.filename, extractedText);
    await appendToGoogleSheet({
      filename: req.file.filename,
      text: extractedText,
    });

    res.status(200).json({
      success: true,
      message: "OCR processing complete",
      file: req.file.filename,
      textFile: textPath,
      csvFile: csvPath,
      textPreview: extractedText.slice(0, 200),
    });
  } catch (error) {
    console.error("Instant OCR Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
