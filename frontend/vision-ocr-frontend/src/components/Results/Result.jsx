import "../Results/Result.css";

export function ResultsSection({ results }) {

  const downloadFile = (content, filename, type) => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:${type};charset=utf-8,${encodeURIComponent(content)}`
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="card">
      <h2 className="results-header">Processing Results</h2>

      <div className="results-grid">

        {/* TEXT RESULT */}
        <div className="result-box">
          <div className="result-box-header">
            <span className="result-box-icon">📄</span>
            <h3>Extracted Text (Preview)</h3>
          </div>

          <div className="result-content">
            <p>{results.preview}</p>
          </div>

          <button
            onClick={() =>
              downloadFile(results.fullText, "extracted-text.txt", "text/plain")
            }
            className="btn-download"
          >
            💾 Download Full TXT
          </button>
        </div>

        {/* CSV RESULT */}
        <div className="result-box">
          <div className="result-box-header">
            <span className="result-box-icon">📊</span>
            <h3>CSV Data</h3>
          </div>

          <div className="result-content">
            <p>{results.csvRow ? "CSV Generated Successfully" : "No CSV Data"}</p>
          </div>

          <button
            onClick={() =>
              downloadFile(results.csvRow, "ocr-results.csv", "text/csv")
            }
            className="btn-download csv"
          >
            💾 Download CSV
          </button>
        </div>
      </div>

      <div className="success-message">
        <p>✓ Processing complete! Your files are ready for download.</p>
      </div>
    </div>
  );
}
