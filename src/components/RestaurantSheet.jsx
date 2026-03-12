import { Sheet } from 'react-modal-sheet'
import { useState } from 'react'
import UpdateStatusForm from './UpdateStatusForm'
import useTimeAgo from '../hooks/useTimeAgo'

const STATUS_LABELS = {
  'open': { text: 'Open – Full Menu', color: 'bg-green-500', emoji: '🟢' },
  'limited': { text: 'Open – Limited Menu', color: 'bg-yellow-500', emoji: '🟡' },
  'closed': { text: 'Closed – No Gas', color: 'bg-red-500', emoji: '🔴' },
  'unknown': { text: 'Unknown', color: 'bg-gray-500', emoji: '⚪' },
}

export default function RestaurantSheet({ restaurant, statusData, onClose, onStatusUpdate, onConfirm }) {
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const { text: timeAgoText, isStale } = useTimeAgo(statusData?.updated_at)

  if (!restaurant) return null

  const status = statusData?.status || 'unknown'
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.unknown
  const confirmations = statusData?.confirmations || 0

  const handleSubmit = async (updateData) => {
    await onStatusUpdate(updateData)
    setShowForm(false)
    setToast("Thanks for helping others find food 🙌")

    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    setTimeout(() => setToast(null), 3000)
  }

  const handleConfirm = async () => {
    if (!statusData?.id || confirming) return
    setConfirming(true)
    try {
      await onConfirm(statusData.id)
      setToast("Thanks for confirming! 👍")
      if (navigator.vibrate) navigator.vibrate(50)
      setTimeout(() => setToast(null), 3000)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Sheet
      isOpen={!!restaurant}
      onClose={onClose}
      snapPoints={[450, 320, 0]}
      initialSnap={1}
    >
      <Sheet.Container style={{ backgroundColor: '#1a1a2e', borderRadius: '20px 20px 0 0' }}>
        <Sheet.Header />
        <Sheet.Content>
          <div className="px-5 pb-6 flex flex-col gap-4">
            {toast && (
              <div className="bg-green-500/20 text-green-300 text-sm font-medium px-4 py-2.5 rounded-xl text-center animate-fade-in">
                {toast}
              </div>
            )}

            {!showForm ? (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white">{restaurant.name}</h2>
                  {restaurant.brand && (
                    <span className="text-white/30 text-xs">🏷️ {restaurant.brand}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">{statusInfo.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-base">{statusInfo.text}</p>
                    {statusData?.updated_at && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-white/40 text-sm">
                          Updated {timeAgoText}
                        </p>
                        {isStale && (
                          <span className="text-yellow-400 text-xs">⚠️ may be outdated</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trust indicator */}
                {confirmations > 0 && (
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
                    <span className="text-sm">👥</span>
                    <span className="text-white/50 text-sm">
                      {confirmations} {confirmations === 1 ? 'person' : 'people'} confirmed this
                    </span>
                  </div>
                )}

                {statusData?.note && (
                  <p className="text-white/50 text-sm italic bg-white/5 rounded-xl px-4 py-3">
                    "{statusData.note}"
                  </p>
                )}

                <div className="flex gap-3">
                  {statusData?.id && status !== 'unknown' && (
                    <button
                      onClick={handleConfirm}
                      disabled={confirming}
                      className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-medium text-sm hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-40"
                    >
                      {confirming ? '...' : '👍 Confirm'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex-1 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-base hover:bg-white/90 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </>
            ) : (
              <UpdateStatusForm
                restaurant={restaurant}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onClose} />
    </Sheet>
  )
}
