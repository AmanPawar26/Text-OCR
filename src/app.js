import express from 'express'
import qwenRoutes from './routes/qwen.routes.js'
import uploadProcessOcrRoutes from "./routes/upload.process.routes.js"


const app = express();
app.use(express.json());

app.use("/api/qwen", qwenRoutes)
app.use("/api/upload-process", uploadProcessOcrRoutes);

export default app;