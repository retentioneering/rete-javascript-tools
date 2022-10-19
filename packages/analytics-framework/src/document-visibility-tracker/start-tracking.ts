import { eventCaptured } from './model/public'

export const startTracking = () => {
  document.addEventListener(
    'visibilitychange',
    () => {
      const visible = document.visibilityState != 'hidden'

      eventCaptured({
        name: visible ? 'document_visible' : 'document_hidden',
        type: 'document-visibility',
        data: {
          visible,
        },
      })
    },
    true,
  )
}
