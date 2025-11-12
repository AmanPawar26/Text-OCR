import cron from "node-cron";
import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import { saveAsTextFile } from "../services/textService.js";
import { appendToCsv } from "../services/csvService.js";
import { appendToGoogleSheet } from "../services/googleSheetService.js";
import { getPromptByCategory } from "../services/promptService.js";

const BASE_DIR = path.resolve("src/uploads/scheduled");

//  Upload + schedule a file
export const uploadAndScheduleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const category = req.body.category || "default";
    const categoryDir = path.join(BASE_DIR, category);
    await fs.ensureDir(categoryDir);

    const targetPath = path.join(categoryDir, req.file.filename);
    await fs.move(req.file.path, targetPath);

    console.log(`File scheduled for OCR: ${req.file.filename} (${category})`);

    // Start scheduler (only if not already running)
    startScheduledOCR();

    res.status(200).json({
      success: true,
      message: "File scheduled for OCR",
      category,
      file: req.file.filename,
      scheduledFolder: categoryDir,
    });
  } catch (error) {
    console.error("Upload Schedule Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//Scheduled OCR Job (runs every minute)
export const startScheduledOCR = () => {
  if (global.schedulerRunning) return; // prevent multiple schedulers
  global.schedulerRunning = true;

  console.log("Scheduler initialized (running every minute).");

  cron.schedule("*/1 * * * *", async () => {
    console.log("Running scheduled OCR job...");

    try {
      // Get category folders only
      const entries = await fs.readdir(BASE_DIR, { withFileTypes: true });
      const categories = entries.filter(e => e.isDirectory()).map(e => e.name);

      for (const category of categories) {
        const categoryPath = path.join(BASE_DIR, category);
        const files = await fs.readdir(categoryPath);

        for (const file of files) {
          const filePath = path.join(categoryPath, file);
          const stats = await fs.stat(filePath);
          if (!stats.isFile()) continue;

          console.log(`Processing file: ${file} (Category: ${category})`);

          const imageBuffer = await fs.readFile(filePath);
          const imageBase64 = imageBuffer.toString("base64");
          const prompt = getPromptByCategory(category);

          // Run OCR via Ollama API
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

          // Create category-based folders under "scheduler"
          const textDir = path.resolve(`src/scheduler/text/${category}`);
          const csvDir = path.resolve(`src/scheduler/csv/${category}`);
          await fs.ensureDir(textDir);
          await fs.ensureDir(csvDir);

          // Save text file
          const textPath = path.join(textDir, `${Date.now()}_${file}.txt`);
          await fs.writeFile(textPath, extractedText);

          const csvPath = path.join(csvDir, `scheduler_results.csv`);
          const csvHeader = "Timestamp,Filename,Extracted Text\n";
          if (!fs.existsSync(csvPath)) {
            await fs.writeFile(csvPath, csvHeader);
          }
          const csvRow = `"${new Date().toISOString()}","${file}","${extractedText.replace(/\r?\n|\r/g, " ").replace(/"/g, "'")}"\n`;
          await fs.appendFile(csvPath, csvRow);

          // Update Google Sheet
          await appendToGoogleSheet({
            timestamp: new Date().toISOString(),
            filename: file,
            text: extractedText,
          });

          // Move processed file
          const processedDir = path.join(categoryPath, "processed");
          await fs.ensureDir(processedDir);
          await fs.move(filePath, path.join(processedDir, file), { overwrite: true });

          console.log(`Scheduler OCR complete (${category})
  • Text saved: ${textPath}
  • CSV saved: ${csvPath}`);
        }
      }

      console.log("Scheduler OCR job completed.");
    } catch (err) {
      console.error("Scheduler OCR Error:", err.message);
    }
  });
};
