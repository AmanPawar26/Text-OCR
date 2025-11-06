import express from "express";
import multer from "multer";
import { extractTextWithQwen } from "../controller/qwen.controller.js";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/extract", upload.single("image"), extractTextWithQwen);

export default router;
