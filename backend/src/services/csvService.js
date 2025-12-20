
// import { createObjectCsvWriter } from "csv-writer";
// import fs from "fs-extra";
// import path from "path";

// export const appendToCsv = async (filePathOrName, text, customDir = null) => {
//   const outputDir = customDir ? path.resolve(customDir) : path.resolve("src/output/csv");
//   await fs.ensureDir(outputDir);

//   const csvPath = path.join(outputDir, "ocr_results.csv");

//   const csvWriter = createObjectCsvWriter({
//     path: csvPath,
//     header: [
//       { id: "timestamp", title: "Timestamp" },
//       { id: "filename", title: "Filename" },
//       { id: "text", title: "ExtractedText" },
//     ],
//     append: true,
//   });

//   const record = {
//     timestamp: new Date().toISOString(),
//     filename: path.basename(filePathOrName),
//     text: text.replace(/\n/g, " "),
//   };

//   await csvWriter.writeRecords([record]);
//   return csvPath;
// };

import { createObjectCsvWriter } from "csv-writer";
import fs from "fs-extra";
import path from "path";

export const appendToCsv = async (filePathOrName, text, customDir = null) => {
  const outputDir = customDir ? path.resolve(customDir) : path.resolve("src/output/csv");
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

  const cleanText = text.replace(/\n/g, " ");

  const record = {
    timestamp: new Date().toISOString(),
    filename: path.basename(filePathOrName),
    text: cleanText,
  };

  // Write the CSV row
  await csvWriter.writeRecords([record]);

  // Build a preview row for frontend
  const csvRow = `"${record.timestamp}","${record.filename}","${record.text.replace(/"/g, '""')}"`;

  return {
    csvPath,
    csvRow,          // <-- send this to frontend
  };
};


