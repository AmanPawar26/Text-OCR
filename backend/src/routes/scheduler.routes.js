import express from "express";
import multer from "multer";
import { uploadAndScheduleFile } from "../controller/scheduler.controller.js";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/schedule", upload.single("file"), uploadAndScheduleFile);

export default router;
