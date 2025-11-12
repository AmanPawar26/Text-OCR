import express from "express";
import multer from "multer";
import { processCustomPromptOCR } from "../controller/custom.prompt.controller.js";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/prompt", upload.single("file"), processCustomPromptOCR);

export default router;
