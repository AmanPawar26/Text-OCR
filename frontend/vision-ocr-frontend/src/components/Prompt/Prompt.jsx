import "../Prompt/Prompt.css"

export function PromptInput({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="prompt-textarea"
      placeholder="Enter your OCR prompt here... (e.g., 'Extract all property details', 'Find all quiz questions')"
    />
  )
}
 