import express from 'express'
import multer from 'multer'
import { extractTextFromImage } from '../controller/ocr.controller.js'

const router = express.Router();
const upload = multer({dest: "src/uploads/"});

router.post("/extract", upload.single("image"), extractTextFromImage);

export default router;
