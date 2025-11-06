import { createObjectCsvWriter } from "csv-writer";
import fs from "fs-extra";
import path from "path";

export const appendToCsv = async (fileName, text) => {
  const outputDir = path.resolve("src/output/csv");
  await fs.ensureDir(outputDir);

  const csvPath = path.join(outputDir, "ocr_results.csv");

  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: "timestamp", title: "Timestamp" },
      { id: "filename", title: "Filename" },
      { id: "text", title: "ExtractedText" },
    ],
    append: true,
  });

  const record = {
    timestamp: new Date().toISOString(),
    filename: fileName,
    text: text.replace(/\n/g, " "),
  };

  await csvWriter.writeRecords([record]);
  return csvPath;
};
