import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { processInstantOCR } from "../controller/upload.process.controller.js";

const router = express.Router();

const upload = multer({ dest: "src/uploads/" });

router.post("/instant", upload.single("file"), processInstantOCR);
export default router;
