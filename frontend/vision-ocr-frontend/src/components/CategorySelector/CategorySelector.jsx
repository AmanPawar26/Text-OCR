import "../CategorySelector/CategorySelector.css"

export function CategorySelector({ value, onChange }) {
  const categories = [
    { id: "default", label: "Default" },
    { id: "real-estate", label: "Real Estate" },
    { id: "quiz-app", label: "Quiz App" },
  ]

  return (
    <div className="category-grid">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`category-btn ${value === cat.id ? "active" : ""}`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}