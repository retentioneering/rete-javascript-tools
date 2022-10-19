import type { createLegacyTransport, Endpoint } from '@rete/analytics-framework'

type GetDefaultReteEndpoint = (transport: typeof createLegacyTransport, fractionAll?: number) => Endpoint

export const ENDPOINT_ROUTE = '/e2e'

export const getDefaultReteEndpoint: GetDefaultReteEndpoint = (transport, fractionAll = 1) => {
  return {
    name: 'default',
    guard: {
      fraction: {
        all: fractionAll,
      },
    },
    transport: transport({
      baseURL: 'https://api.local',
      path: ENDPOINT_ROUTE,
      source: 'e2e',
      version: '1.0.0',
    }),
  }
}
