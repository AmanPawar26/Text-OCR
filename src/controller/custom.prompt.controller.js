import path from "path";
import fs from "fs-extra";
import fetch from "node-fetch";
import { saveAsTextFile } from "../services/textService.js";
import { appendToCsv } from "../services/csvService.js";
import { appendToGoogleSheet } from "../services/googleSheetService.js";
import { getPromptByCategory } from "../services/promptService.js";

const BASE_DIR = path.resolve("src/uploads/custom");

export const processCustomPromptOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { prompt, category } = req.body;
    const categoryName = category?.toLowerCase() || "default";
    const categoryDir = path.join(BASE_DIR, categoryName);

    // Ensure directories exist
    const textDir = path.join(categoryDir, "text");
    const csvDir = path.join(categoryDir, "csv");
    await fs.ensureDir(textDir);
    await fs.ensureDir(csvDir);

    const imagePath = path.resolve(`src/uploads/${req.file.filename}`);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    console.log(`Running Custom Prompt OCR for: ${req.file.filename} (Category: ${categoryName})`);

    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    // Final prompt = category prompt + user prompt (if given)
    const categoryPrompt = getPromptByCategory(categoryName);
    const finalPrompt =
      prompt?.trim()
        ? `${categoryPrompt}\n\nAdditional User Instruction:\n${prompt.trim()}`
        : categoryPrompt;

    console.log("📝 Final Prompt Used:\n", finalPrompt);

    // Call Ollama MiniCPM-V model
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "minicpm-v:8b",
        prompt: finalPrompt,
        images: [imageBase64],
        stream: false,
      }),
    });

    const data = await response.json();
    const extractedText = data?.response?.trim() || "No text found";

    // Save text and CSV under custom/category/ folders
    const textFilePath = path.join(textDir, `${Date.now()}_${req.file.originalname}.txt`);
    await fs.writeFile(textFilePath, extractedText);

    const csvFilePath = path.join(csvDir, `${Date.now()}_${req.file.originalname}.csv`);
    await fs.writeFile(
      csvFilePath,
      `"Timestamp","Filename","ExtractedText"\n"${new Date().toISOString()}","${req.file.originalname}","${extractedText
        .replace(/\r?\n|\r/g, " ")
        .replace(/"/g, "'")}"`
    );

    // Update Google Sheet
    await appendToGoogleSheet({
      timestamp: new Date().toISOString(),
      filename: req.file.originalname,
      text: extractedText,
    });

    // Remove temp upload
    await fs.remove(imagePath);

    res.status(200).json({
      success: true,
      message: `Custom Prompt OCR completed (${categoryName})`,
      category: categoryName,
      file: req.file.originalname,
      textFile: textFilePath,
      csvFile: csvFilePath,
    });
  } catch (error) {
    console.error("Custom Prompt OCR Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
