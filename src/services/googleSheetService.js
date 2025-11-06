import { google } from "googleapis";

export const appendToGoogleSheet = async ({ filename, text }) => {
  try {
    const keyPath = process.env.GOOGLE_SHEETS_KEY_PATH;
    const sheetId = process.env.SHEET_ID;

    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ---- Step 1: Ensure header row exists ----
    const sheetName = "Sheet2";
    const header = [["Timestamp", "Filename", "ExtractedText"]];

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:C1`,
    });

    if (!existing.data.values || existing.data.values.length === 0) {
      console.log("🧾 Header row not found — creating one...");
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:C1`,
        valueInputOption: "RAW",
        resource: { values: header },
      });
    }

    // ---- Step 2: Append new OCR data ----
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const cleanText = (text || "").replace(/\r?\n|\r/g, " ").replace(/"/g, "'");
    const row = [timestamp, filename, cleanText];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:C`,
      valueInputOption: "RAW",
      resource: { values: [row] },
    });

    console.log("Google Sheet updated successfully");
  } catch (error) {
    console.error("Google Sheets Error:", error.message);
  }
};
