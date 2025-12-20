import { useState } from "react"
import "../FileUpload/FileUpload.css"

export function FileUploadSection({ onFileSelect }) {
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      onFileSelect(files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0])
    }
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`file-upload-area ${isDragActive ? "drag-active" : ""}`}
    >
      <input type="file" onChange={handleFileInput} id="file-upload" accept="image/*,.pdf" />
      <label htmlFor="file-upload">
        <span className="file-upload-icon">📤</span>
        <p>Drag and drop your document here</p>
        <p className="file-upload-hint">or click to browse (PNG, JPG, PDF)</p>
      </label>
    </div>
  )
}
