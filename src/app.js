import express from 'express'
import ocrRoutes from './routes/ocr.routes.js'

const app = express();
app.use(express.json());

app.use("/api/ocr", ocrRoutes)

export default app;