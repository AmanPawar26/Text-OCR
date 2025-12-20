# AI-Powered OCR Automation Platform

A full-stack, production-style OCR automation system that uses a **local Vision LLM (MiniCPM-V via Ollama)** to extract text from images and documents, with support for **on-demand OCR, scheduled batch processing, and custom prompt-based extraction**.  
The platform automatically exports results to **TXT, CSV, and Google Sheets**, eliminating manual data entry.

---

## 📌 Project Overview

Manual extraction of text from scanned documents (invoices, receipts, forms, study material) is repetitive, slow, and error-prone.  
This project solves that problem by building an **AI-driven OCR automation pipeline** that:

- Extracts high-accuracy text using a Vision Language Model
- Supports category-based and custom prompt OCR
- Runs both **instantly** and on a **schedule**
- Automatically syncs structured results to Google Sheets



---

## 🚀 Key Features

### 🔹 Feature 1: Scheduled Folder OCR Processing
- Upload a batch/folder of files (images or PDFs)
- Configure a scheduler (hourly / daily using `node-cron`)
- Automatically runs OCR using MiniCPM-V
- Outputs:
  - Structured CSV file
  - Auto-synced Google Sheet
- Maintains logs for:
  - Timestamp
  - Files processed
  - Errors (if any)

**Use Case:**  
A real estate firm uploads scanned property listings daily.  
The system extracts structured details and syncs them to a shared Google Sheet automatically.

---

### 🔹 Feature 2: Upload & Process (On-Demand OCR)
- Upload a single document
- Instant OCR processing
- Outputs:
  - `.txt` file (full extracted text)
  - `.csv` file (structured format)
  - Google Sheets row
- Preview extracted text directly in the UI
- One-click downloads

**Use Case:**  
A student uploads a scanned report or quiz page and instantly gets structured text and downloadable files.

---

### 🔹 Feature 3: Custom Prompt OCR
- User-defined OCR prompts
- Examples:
  - “Extract only numerical data and tables”
  - “Summarize key financial terms”
- Prompt is passed directly to MiniCPM-V
- Outputs:
  - TXT
  - CSV
  - Google Sheets

**Use Case:**  
Researchers or analysts extract only relevant data without post-processing.

---

## 🧠 AI & OCR Stack

- **MiniCPM-V** – Vision Language Model for OCR + reasoning
- **Ollama** – Local model runtime (no cloud dependency)
- **Prompt Engineering** – Dynamic OCR behavior
- **Vision-Language Processing** – OCR beyond traditional engines

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- node-cron (scheduler)
- Google Sheets API
- Service-based architecture

### Frontend
- React
- File upload & preview UI
- Download support (TXT, CSV)

### AI & Automation
- MiniCPM-V (Vision LLM)
- Ollama (local inference)
- Prompt-based extraction

---

## 🏗️ System Architecture

React UI
↓
Express API
↓
MiniCPM-V (via Ollama)
↓
Text / CSV Services
↓
Google Sheets Sync


---

## 🔄 Workflow Breakdown

### 1️⃣ File Upload
- User uploads a document (single or batch)
- File stored temporarily on backend

### 2️⃣ OCR Processing
- Image converted to Base64
- Sent to MiniCPM-V with selected prompt
- Model returns extracted text

### 3️⃣ Data Export
- TXT file saved
- CSV row appended
- Google Sheet updated automatically

### 4️⃣ Optional Scheduling
- `node-cron` triggers OCR runs
- Processes all files in a folder
- Logs each execution

---

## 🧪 Quantitative Impact

- **Processing Time**
  - Manual: 5–10 minutes/document
  - Automated: ~10–20 seconds/document

- **Error Reduction**
  - ~80–90% fewer transcription errors

- **Scalability**
  - Batch + scheduled processing
  - No human intervention required

---

## 🧠 How AI Was Used

### What I Built Independently
- OCR pipeline and backend APIs
- Scheduling logic
- CSV, text, and Sheets services
- Frontend UI
- End-to-end system design

### How AI Helped
- Prompt design for OCR accuracy
- Debugging extraction behavior
- Optimizing prompt clarity
- Reasoning about edge cases

### Example Prompts
- “Extract all visible text while preserving logical order.”
- “Extract only numerical values and tabular data.”
- “Summarize key financial terms from this document.”

---

## 📂 Project Structure



backend/
├── controllers/
├── services/
│ ├── textService.js
│ ├── csvService.js
│ ├── googleSheetService.js
│ └── promptService.js
├── uploads/
├── output/
frontend/
├── components/
├── services/
└── pages/


---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js
- Ollama installed locally
- Google Cloud Service Account (Sheets API enabled)

### 1️⃣ Install Ollama & Model
```bash
ollama pull minicpm-v

2️⃣ Backend Setup
cd backend
npm install
npm run dev

3️⃣ Frontend Setup
cd frontend
npm install
npm start
