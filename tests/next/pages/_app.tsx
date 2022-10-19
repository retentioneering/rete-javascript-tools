import type { AppType } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'

const App: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Script id='effector-script' src={'js/effector.js'} />
      <Script id='patronum-script' src={'js/patronum.js'} />
      <Head>
        <title>E2E tests with Cypress</title>
        <meta name='description' content='Description for e2e-tests' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App
