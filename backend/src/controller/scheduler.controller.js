import cron from "node-cron";
import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import { saveAsTextFile } from "../services/textService.js";
import { appendToCsv } from "../services/csvService.js";
import { appendToGoogleSheet } from "../services/googleSheetService.js";
import { getPromptByCategory } from "../services/promptService.js";

const BASE_DIR = path.resolve("src/uploads/scheduled");

// 📤 Upload + schedule a file
export const uploadAndScheduleFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const category = req.body.category?.toLowerCase() || "default";
    const categoryDir = path.join(BASE_DIR, category);
    await fs.ensureDir(categoryDir);

    // 🧹 Clean out old files from this category folder before scheduling a new one
    const oldFiles = await fs.readdir(categoryDir);
    for (const old of oldFiles) {
      await fs.remove(path.join(categoryDir, old));
    }

    // ✅ Move uploaded file into scheduled/<category>
    const targetPath = path.join(categoryDir, req.file.filename);
    if (req.file.path !== targetPath) {
      await fs.move(req.file.path, targetPath, { overwrite: true });
    }

    console.log(`✅ File scheduled for OCR: ${req.file.filename} (${category})`);

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
    console.error("❌ Upload Schedule Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🕒 Scheduled OCR Job (runs every minute)
export const startScheduledOCR = () => {
  if (global.schedulerRunning) return;
  global.schedulerRunning = true;

  console.log("🕒 Scheduler initialized (running every minute).");

  let isOcrRunning = false; // 🧠 Prevent overlapping runs

  cron.schedule("*/1 * * * *", async () => {
    if (isOcrRunning) {
      console.log("⏳ Previous OCR job still running — skipping this minute.");
      return;
    }

    isOcrRunning = true;
    console.log("⏰ Running scheduled OCR job...");

    try {
      const entries = await fs.readdir(BASE_DIR, { withFileTypes: true });
      let categories = entries.filter(e => e.isDirectory()).map(e => e.name);

      // // ⚙️ Ignore 'default' if other category folders exist
      // if (categories.includes("default") && categories.length > 1) {
      //   categories = categories.filter(c => c !== "default");
      // }

      for (const category of categories) {
        const currentCategory = category;
        const categoryPath = path.join(BASE_DIR, currentCategory);
        const files = await fs.readdir(categoryPath);

        console.log(`📂 Found ${files.length} file(s) in category: ${currentCategory}`);

        for (const file of files) {
          const filePath = path.join(categoryPath, file);
          const stats = await fs.stat(filePath);
          if (!stats.isFile()) continue;

          console.log(`📄 Processing file: ${file} (Category: ${currentCategory})`);

          const imageBuffer = await fs.readFile(filePath);
          const imageBase64 = imageBuffer.toString("base64");
          const prompt = getPromptByCategory(currentCategory);

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

          const textDir = path.resolve(`src/scheduler/text/${currentCategory}`);
          const csvDir = path.resolve(`src/scheduler/csv/${currentCategory}`);
          await fs.ensureDir(textDir);
          await fs.ensureDir(csvDir);

          const textPath = await saveAsTextFile(file, extractedText, textDir);
          const { csvPath, csvRow } = await appendToCsv(file, extractedText, csvDir);


          await appendToGoogleSheet({
            timestamp: new Date().toISOString(),
            filename: file,
            text: extractedText,
          });

          await fs.remove(filePath);

          console.log(`✅ Scheduler OCR complete (${currentCategory})
  6️⃣ Text saved in: ${textPath}
  6️⃣ CSV saved in: ${csvPath}`);
        }
      }

      console.log("✅ Scheduler OCR job completed.");
    } catch (err) {
      console.error("❌ Scheduler OCR Error:", err.message);
    } finally {
      isOcrRunning = false; // 🔓 Release lock
    }
  });
};


