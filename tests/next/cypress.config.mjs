import cypress from 'cypress'

export default cypress.defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
    },
  },
  fixturesFolder: false,
  video: false,
  screenshotOnRunFailure: false,
})
