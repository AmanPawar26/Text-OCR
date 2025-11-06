import Tesseract from "tesseract.js";
import fs from "fs";

export const extractTextFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const imagePath = req.file.path;

  

    const { data: { text } } = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => console.log(m),
    });

    // Remove uploaded image after OCR
    fs.unlinkSync(imagePath);

    res.status(200).json({
      success: true,
      message: "OCR successful",
      extractedText: text.trim(),
    });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to extract text",
      error: error.message,
    });
  }
};
