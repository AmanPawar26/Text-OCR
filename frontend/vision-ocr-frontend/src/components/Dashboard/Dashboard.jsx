import { useState } from "react"
import { FileUploadSection } from "../FileUpload/FileUpload"
import { PromptInput } from "../Prompt/Prompt"
import { CategorySelector } from "../CategorySelector/CategorySelector"
import { ResultsSection } from "../Results/Result"
import "../Dashboard/Dashboard.css"
import { processInstantOCR, scheduleFileForOCR, processCustomPromptOCR } from "../../services/api"

export function OcrDashboard() {
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("default")
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)

  const handleFileUpload = (file) => {
    setUploadedFile(file)
  }

  // ⚡ Instant OCR
  const handleProcess = async () => {
    if (!uploadedFile) {
      alert("Please upload a file")
      return
    }

    setIsProcessing(true)

    try {
      const result = await processInstantOCR({
        file: uploadedFile,
        prompt,
        category,
      })

      if (!result.success) {
        alert("Processing failed: " + result.error)
        return
      }

      // Match what ResultsSection expects
    setResults({
  fullText: result.text,
  preview: result.preview,
  csvRow: result.csv,
});



    } catch (err) {
      console.error("Process Error:", err)
      alert("Error communicating with backend")
    }

    setIsProcessing(false)
  }

  // ⏳ Scheduler Upload
  const handleSchedule = async () => {
    if (!uploadedFile) {
      alert("Please upload a file first")
      return
    }

    const res = await scheduleFileForOCR({
      file: uploadedFile,
      category: category,   // FIXED: correct variable
    })

    console.log("Scheduler Response:", res)

    if (res.success) {
      alert("File scheduled! It will be processed automatically every minute.")
    } else {
      alert("Error: " + res.error)
    }
  }

  // 🧠 Custom Prompt OCR
  const handleCustomPrompt = async () => {
    if (!uploadedFile) {
      alert("Please upload a file first");
      return;
    }

    if (!prompt.trim()) {
      alert("Please enter a custom prompt");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processCustomPromptOCR({
        file: uploadedFile,
        prompt,
        category,
      });

      if (!result.success) {
        alert("Custom OCR failed: " + result.error);
        return;
      }

      setResults({
        fullText: result.results.fullText,
        preview: result.results.preview,
        csvRow: result.results.csvRow,
      });

    } catch (err) {
      console.error("Custom Prompt OCR Error:", err);
      alert("Error processing custom OCR");
    }

    setIsProcessing(false);
  };


  return (
    <div className="ocr-container">
      <header>
        <div className="container">
          <div className="header-icon">📄</div>
          <div className="header-text">
            <h1>Vision OCR</h1>
            <p>IntelliDoc Automation Platform</p>
          </div>
        </div>
      </header>

      <main>
        <div className="content-wrapper">

          <div className="card">
            <h2>OCR Prompt</h2>
            <PromptInput value={prompt} onChange={setPrompt} />
          </div>

          <div className="card">
            <h2>Upload Document</h2>
            <FileUploadSection onFileSelect={handleFileUpload} />
            {uploadedFile && (
              <div className="file-selected-info">
                <p>✓ File selected: {uploadedFile.name}</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Document Category</h2>
            <CategorySelector value={category} onChange={setCategory} />
          </div>

          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="btn btn-primary"
          >
            ⚡ {isProcessing ? "Processing..." : "Process"}
          </button>

          <button
            onClick={handleSchedule}   // FIXED: using real function
            className="btn btn-secondary"
          >
            ⏳ Schedule Upload
          </button>

          <button
            onClick={handleCustomPrompt}
            disabled={isProcessing}
            className="btn btn-warning"
          >
            🧠 Custom Prompt OCR
          </button>

        </div>

        {results && (
          <div className="results-container">
            <ResultsSection results={results} />
          </div>
        )}
      </main>
    </div>
  )
}
