import fetch from "node-fetch";
import path from "path";
import fs from "fs";

export const extractTextWithMinicpm = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = path.resolve(`src/uploads/${req.file.filename}`);

    // Make sure file exists before sending to Ollama
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image file not found" });
    }

    console.log("Processing image:", imagePath);

    // Ollama expects a base64-encoded image, not a file path
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
        stream: false, // make sure we get full JSON output
      }),
    });

    const data = await response.json();

    res.status(200).json({
      success: true,
      text: data?.response || "No text found",
    });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ success: false, error: "Failed to extract text" });
  }
};
