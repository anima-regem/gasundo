import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open – Full Menu', emoji: '🟢' },
  { value: 'limited', label: 'Open – Limited Menu', emoji: '🟡' },
  { value: 'closed', label: 'Closed – No Gas', emoji: '🔴' },
]

export default function UpdateStatusForm({ restaurant, onSubmit, onCancel }) {
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!status) return

    setSubmitting(true)
    try {
      await onSubmit({
        restaurant_name: restaurant.name,
        lat: restaurant.lat,
        lng: restaurant.lng,
        status,
        note: note.trim() || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-1">
      <div className="flex flex-col gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatus(opt.value)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all text-base font-medium
              ${status === opt.value
                ? 'bg-white/20 ring-2 ring-white/40 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
          >
            <span className="text-xl">{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Add a note (optional) e.g. 'No tandoor items'"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 font-medium text-sm hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!status || submitting}
          className="flex-1 py-3 rounded-xl bg-white font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-900 hover:bg-white/90"
        >
          {submitting ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
