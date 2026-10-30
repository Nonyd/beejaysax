import { revalidatePath } from 'next/cache'

/**
 * Refreshes the cached public pages of one event (its page and checkout), or of every event when
 * no id is given (e.g. a site-wide discount code). Call after anything they show changes.
 */
export function revalidateEventPages(eventId?: string | null) {
  if (eventId) {
    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/events/${eventId}/purchase`)
  } else {
    revalidatePath('/events/[id]', 'layout')
  }
}
