import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { saveAsTextFile } from "../services/textService.js";
import { appendToCsv } from "../services/csvService.js";
import { appendToGoogleSheet } from "../services/googleSheetService.js";
import { getPromptByCategory } from "../services/promptService.js"; // ✅ new import

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

    // 🧩 Get category-based prompt
    const category = req.body.category || "default";
    const prompt = getPromptByCategory(category);

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

    // 💾 Save outputs and update Sheet
    const textPath = await saveAsTextFile(req.file.filename, extractedText);
    const csvPath = await appendToCsv(req.file.filename, extractedText);
    await appendToGoogleSheet({
      filename: req.file.filename,
      text: extractedText,
    });

    res.status(200).json({
      success: true,
      message: `OCR processing complete (${category})`,
      category,
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
