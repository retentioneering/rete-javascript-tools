import type { createLegacyTransport, start } from '@rete/analytics-framework'
import type { NextPage } from 'next'
import Script from 'next/script'

import { getDefaultReteEndpoint } from '~/utils/rete-config'

const ZeroFractionPage: NextPage = () => {
  return (
    <>
      <Script
        id='rete-analytics-framework'
        src={'js/rete.js'}
        onLoad={() => {
          const rete = (window as any).ReteAnalyticsFramework as {
            start: typeof start
            createLegacyTransport: typeof createLegacyTransport
          }

          rete.start({
            endpoints: [getDefaultReteEndpoint(rete.createLegacyTransport, 0)],
          })
        }}
      />

      <main>
        <h1>Zero Fraction Page</h1>
      </main>
    </>
  )
}

export default ZeroFractionPage
