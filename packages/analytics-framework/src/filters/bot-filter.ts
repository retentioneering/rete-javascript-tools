import type { EndpointFilter } from '~/types'

export const botFilter: EndpointFilter = event => {
  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(event.metadata.userAgent)
  return !isBot
}
