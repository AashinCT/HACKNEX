import { exampleQuestions } from '../../data/mockData'

export default function QuestionInput({ value, onChange, disabled = false }) {
  return (
    <div>
      <label htmlFor="question" className="sr-only">
        Your question
      </label>
      <textarea
        id="question"
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="Ask a question about your data..."
        className="w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[15px] placeholder:text-muted focus:border-accent focus:outline-none disabled:bg-slate-50"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Try:</span>
        {exampleQuestions.map((example) => (
          <button
            key={example}
            type="button"
            disabled={disabled}
            onClick={() => onChange(example)}
            className="rounded-full border border-line bg-white px-3 py-1 text-xs text-muted transition-colors hover:border-slate-300 hover:text-ink disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}