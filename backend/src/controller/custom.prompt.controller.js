// import path from "path";
// import fs from "fs-extra";
// import fetch from "node-fetch";
// import { saveAsTextFile } from "../services/textService.js";
// import { appendToCsv } from "../services/csvService.js";
// import { appendToGoogleSheet } from "../services/googleSheetService.js";
// import { getPromptByCategory } from "../services/promptService.js";

// const BASE_DIR = path.resolve("src/custom");

// export const processCustomPromptOCR = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const { prompt, category } = req.body;
//     const categoryName = category?.toLowerCase() || "default";

//     // ✅ Create text and CSV directories
//     const textDir = path.join(BASE_DIR, "text");
//     const csvDir = path.join(BASE_DIR, "csv");
//     await fs.ensureDir(textDir);
//     await fs.ensureDir(csvDir);

//     // Uploaded file path
//     const imagePath = path.resolve(`src/uploads/${req.file.filename}`);
//     if (!fs.existsSync(imagePath)) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     console.log(`⚙️ Running Custom Prompt OCR for: ${req.file.originalname} (Category: ${categoryName})`);

//     const imageBuffer = await fs.readFile(imagePath);
//     const imageBase64 = imageBuffer.toString("base64");

//     // 🧠 Combine category-specific prompt + user prompt (if provided)
//     const categoryPrompt = getPromptByCategory(categoryName);
//     const finalPrompt = prompt?.trim()
//       ? `${categoryPrompt}\n\nAdditional User Instruction:\n${prompt.trim()}`
//       : categoryPrompt;

//     console.log("📝 Final Prompt Used:\n", finalPrompt);

//     // 🪄 Send request to MiniCPM-V OCR model
//     const response = await fetch("http://localhost:11434/api/generate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: "minicpm-v:8b",
//         prompt: finalPrompt,
//         images: [imageBase64],
//         stream: false,
//       }),
//     });

//     const data = await response.json();
//     const extractedText = data?.response?.trim() || "No text found";

//     // 💾 Save Text and CSV files (using services)
//     const timestamp = Date.now();
//     const textFilePath = await saveAsTextFile(req.file.originalname, extractedText, textDir);
//     const csvFilePath = await appendToCsv(req.file.originalname, extractedText, csvDir);


//     await saveAsTextFile(textFilePath, extractedText);
//     await appendToCsv(csvFilePath, extractedText);

//     // 🧾 Update Google Sheets
//     await appendToGoogleSheet({
//       timestamp: new Date().toISOString(),
//       filename: req.file.originalname,
//       text: extractedText,
//     });

//     // 🧹 Remove temporary upload file
//     await fs.remove(imagePath);

//     res.status(200).json({
//       success: true,
//       message: `Custom Prompt OCR completed (${categoryName})`,
//       category: categoryName,
//       file: req.file.originalname,
//       scheduler: {
//         textFile: textFilePath,
//         csvFile: csvFilePath,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Custom Prompt OCR Error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

import path from "path";
import fs from "fs-extra";
import fetch from "node-fetch";
import { saveAsTextFile } from "../services/textService.js";
import { appendToCsv } from "../services/csvService.js";
import { appendToGoogleSheet } from "../services/googleSheetService.js";
import { getPromptByCategory } from "../services/promptService.js";

const BASE_DIR = path.resolve("src/custom");

export const processCustomPromptOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { prompt, category } = req.body;
    const categoryName = category?.toLowerCase() || "default";

    // Prepare save folders
    const textDir = path.join(BASE_DIR, "text");
    const csvDir = path.join(BASE_DIR, "csv");
    await fs.ensureDir(textDir);
    await fs.ensureDir(csvDir);

    // Uploaded file path
    const imagePath = path.resolve(`src/uploads/${req.file.filename}`);
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    console.log(`⚙️ Running Custom Prompt OCR for: ${req.file.originalname}`);

    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    // Build final prompt
    const categoryPrompt = getPromptByCategory(categoryName);
    const finalPrompt = prompt?.trim()
      ? `${categoryPrompt}\n\nAdditional User Instruction:\n${prompt.trim()}`
      : categoryPrompt;

    console.log("📝 Final Prompt Used:\n", finalPrompt);

    // Send to MiniCPM
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

    // Save text + CSV once (correct)
    const textFilePath = await saveAsTextFile(req.file.originalname, extractedText, textDir);
    const { csvPath, csvRow } = await appendToCsv(req.file.originalname, extractedText, csvDir);


    // Update sheet
    await appendToGoogleSheet({
      timestamp: new Date().toISOString(),
      filename: req.file.originalname,
      text: extractedText,
    });

    // Remove uploaded temp file
    await fs.remove(imagePath);
    // Read CSV so we can send content to frontend


    res.status(200).json({
      success: true,
      message: "Custom Prompt OCR completed",
      category: categoryName,
      file: req.file.originalname,
      results: {
        fullText: extractedText,
        preview: extractedText.slice(0, 500),
        textFile: textFilePath,
        csvFile: csvPath,
        csvRow: csvRow,
      },
    });



  } catch (error) {
    console.error("❌ Custom Prompt OCR Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
