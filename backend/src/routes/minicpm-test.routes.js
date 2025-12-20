import express from "express";
import multer from "multer";
import { extractTextWithMinicpm } from "../controller/minicpm-test.controller.js";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/extract", upload.single("image"), extractTextWithMinicpm);

export default router;
