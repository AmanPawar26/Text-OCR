import express from 'express'
import minicpmRoutes from './routes/minicpm-test.routes.js'
import uploadProcessOcrRoutes from "./routes/upload.process.routes.js"
import schedulerRoutes from "./routes/scheduler.routes.js"
import customPrompt from "./routes/custom.prompt.routes.js"
const app = express();
app.use(express.json());


app.use("/api/minicpm", minicpmRoutes)
app.use("/api/upload-process", uploadProcessOcrRoutes);
app.use("/api/cron/", schedulerRoutes)
app.use("/api/custom/", customPrompt)

export default app;