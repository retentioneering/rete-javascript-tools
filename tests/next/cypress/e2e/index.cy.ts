import type { LegacyEvent } from '@rete/analytics-framework'

import { ENDPOINT_ROUTE } from '~/utils/rete-config'

describe('Basic e2e tests for tracker', () => {
  type EventConfigItem = {
    name: string
    alias: string
    contain: Partial<LegacyEvent>
  }

  const EVENTS_CONFIG: EventConfigItem[] = [
    {
      name: 'start_session',
      alias: 'StartSession',
      contain: {
        index: 1,
        event_value: 'first_session',
      },
    },
    {
      name: 'tracker_created',
      alias: 'TrackerCreated',
      contain: {
        // TODO: This event should be FIRST
        index: 2,
      },
    },
    {
      name: 'new_user',
      alias: 'NewUser',
      contain: {
        index: 3,
      },
    },
    {
      name: 'dom_content_loaded',
      alias: 'DomContentLoaded',
      contain: {
        index: 4,
      },
    },
    {
      name: 'window_loaded',
      alias: 'WindowLoaded',
      contain: {
        index: 5,
      },
    },
    {
      name: 'pageview',
      alias: 'PageView',
      contain: {
        index: 6,
      },
    },
  ]

  const prepareInterceptors = () => {
    for (const item of EVENTS_CONFIG) {
      cy.intercept(ENDPOINT_ROUTE, req => {
        if (req.body.event_name === item.name) {
          req.alias = item.alias
        }
      })
    }
  }

  const checkIsCypressError = (error: Error): boolean => error.name === 'CypressError'

  const checkIsTimeoutError = (error: Error): boolean => error.message.includes('Timed out')

  const checkIsRequestDetected = (error: Error): boolean => {
    return EVENTS_CONFIG.map((event): string => event.alias).some((alias): boolean => error.message.includes(alias))
  }

  it('should contain all necessary events and it details if fraction is 100%', () => {
    cy.clearCookies().clearLocalStorage()

    prepareInterceptors()

    cy.visit('/')

    for (const item of EVENTS_CONFIG) {
      cy.wait(`@${item.alias}`).its('request.body').should('contain', item.contain)
    }
  })

  it('should not send any events if fraction is 0%', () => {
    cy.clearCookies().clearLocalStorage()

    // @see https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/fundamentals__errors
    cy.on('fail', error => {
      // We can simply return `false` to avoid failing the test on uncaught error,
      // but a better strategy is to make sure the error is expected,
      if (checkIsCypressError(error) && checkIsTimeoutError(error) && checkIsRequestDetected(error)) {
        // We expected this error, so let's ignore it and let the test continue
        return false
      }

      // On any other error message the test fails
      throw error
    })

    prepareInterceptors()

    cy.visit('/zero-fraction')

    for (const item of EVENTS_CONFIG) {
      cy.wait(`@${item.alias}`).then(() => {
        throw new Error('Error: Request found')
      })
    }

    // NOTE: After the `cy.wait` fails and the test fails
    // the remaining commands are NOT executed
    // thus this failing assertion never gets to run.
    cy.wrap(false).should('be.true')
  })
})

export {}
