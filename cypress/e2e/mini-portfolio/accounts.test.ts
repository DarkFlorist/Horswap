import { getTestSelector } from '../../utils'

describe('Mini Portfolio account drawer', () => {
  it('fetches balances when account button is first hovered', () => {
    // The balances should not be fetched before the account button is hovered
    cy.get('@portfolioSpy').should('not.have.been.called')

    // Balances should have been fetched once after hover
    cy.get(getTestSelector('web3-status-connected')).trigger('mouseover')
    cy.get('@portfolioSpy').should('have.been.calledOnce')
  })

  it('should not re-fetch balances on second hover', () => {
    // The balances should not be fetched before the account button is hovered
    cy.get('@portfolioSpy').should('not.have.been.called')

    // Balances should have been fetched once after hover
    cy.get(getTestSelector('web3-status-connected')).trigger('mouseover')
    cy.get('@portfolioSpy').should('have.been.calledOnce')

    // Balances should not be refetched upon second hover
    cy.get(getTestSelector('web3-status-connected')).trigger('mouseover')
    cy.get('@portfolioSpy').should('have.been.calledOnce')
  })

  it('should not re-fetch balances when the account drawer is opened', () => {
    // The balances should not be fetched before the account button is hovered
    cy.get('@portfolioSpy').should('not.have.been.called')

    // Balances should have been fetched once after hover
    cy.get(getTestSelector('web3-status-connected')).trigger('mouseover')
    cy.get('@portfolioSpy').should('have.been.calledOnce')

    // Balances should not be refetched upon opening drawer
    cy.get(getTestSelector('web3-status-connected')).click()
    cy.get('@portfolioSpy').should('have.been.calledOnce')
  })

  it('refetches balances when account changes', () => {
    cy.hardhat().then((hardhat) => {
      const accountA = hardhat.wallets[0].address
      const accountB = hardhat.wallets[1].address

      // Opens the account drawer
      cy.get(getTestSelector('web3-status-connected')).click()

      // A shortened version of the first account's address should be shown
      cy.contains(accountA.slice(0, 6)).should('exist')

      // Stores the current portfolio balance to later compare to next account's balance
      cy.get(getTestSelector('portfolio-total-balance'))
        .invoke('text')
        .then((originalBalance) => {
          // TODO(INFRA-3) Replace window.ethereum access below with cypress-hardhat utility
          // Simulates the wallet changing accounts via eip-1193 event
          cy.window().then((win) => win.ethereum.emit('accountsChanged', [accountB]))

          // The second account's address should now be shown
          cy.contains(accountB.slice(0, 6)).should('exist')

          // The second account's portfolio balance should differ from the original balance
          cy.get(getTestSelector('portfolio-total-balance')).should('not.have.text', originalBalance)
        })
    })
  })

  it('fetches ENS name', () => {
    cy.hardhat().then(() => {
      const haydenAccount = '0x50EC05ADe8280758E2077fcBC08D878D4aef79C3'
      const haydenENS = 'hayden.eth'

      // Opens the account drawer
      cy.get(getTestSelector('web3-status-connected')).click()

      // Simulate wallet changing to Hayden's account
      cy.window().then((win) => win.ethereum.emit('accountsChanged', [haydenAccount]))

      // Hayden's ENS name should be shown
      cy.contains(haydenENS).should('exist')

      // Close account drawer
      cy.get(getTestSelector('close-account-drawer')).click()

      // Switch chain to Polygon
      cy.get(getTestSelector('chain-selector')).eq(1).click()
      cy.contains('Polygon').click()

      //Reopen account drawer
      cy.get(getTestSelector('web3-status-connected')).click()

      // Simulate wallet changing to Hayden's account
      cy.window().then((win) => win.ethereum.emit('accountsChanged', [haydenAccount]))

      // Hayden's ENS name should be shown
      cy.contains(haydenENS).should('exist')
    })
  })
})
