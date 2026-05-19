import { useCallback, useEffect, useState } from 'react'

/**
 * Busy state for destructive confirm modals that submit via `useFetcher`.
 * Gating only on `fetcher.state === 'submitting'` lets the button stop
 * spinning before the modal closes (fetcher can return to `idle` briefly).
 * Keeps the modal busy until the fetcher leaves idle after the user confirms.
 */
export const useDestructiveConfirmBusy = (
  isModalOpen: boolean,
  submitInFlight: boolean,
) => {
  const [confirmArmed, setConfirmArmed] = useState(false)
  const busy = confirmArmed || submitInFlight

  useEffect(() => {
    if (isModalOpen) {
      setConfirmArmed(false)
    }
  }, [isModalOpen])

  useEffect(() => {
    if (!isModalOpen && confirmArmed) {
      setConfirmArmed(false)
    }
  }, [isModalOpen, confirmArmed])

  const beginSubmit = useCallback((submit: () => void) => {
    setConfirmArmed(true)
    submit()
  }, [])

  const clearArmed = useCallback(() => {
    setConfirmArmed(false)
  }, [])

  return { busy, beginSubmit, clearArmed }
}
