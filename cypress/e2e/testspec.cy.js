describe('Product App Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001/');
    cy.intercept('GET', '/product', { fixture: 'products.json' }).as('getProducts');
    cy.wait('@getProducts');
  });

  it('should load the application and display initial state', () => {
    cy.get('.product').should('have.length.greaterThan', 0).then(() => {
      cy.log('Products loaded successfully');
    });
  });

  it('should search for a product and display filtered results', () => {
    const searchTerm = 'Test Product 1'; // Replace with an actual product name from your fixture
    cy.get('.searchBar').type(searchTerm);
    cy.get('.product').should('exist').each((product) => {
      cy.wrap(product).contains(searchTerm, { matchCase: false });
    }).then(() => {
      cy.log('Search results displayed successfully');
    });
  });

  it('should add a product to the cart and verify the cart updates', () => {
    cy.get('.product').should('exist').first().find('button').click();
    cy.get('.cartArea h3').should('contain', 'Products: 1').then(() => {
      cy.log('Product added to cart successfully');
    });
  });

  it('should buy items in the cart and verify success state', () => {
    cy.get('.product').should('exist').first().find('button').click();
    cy.intercept('POST', '/order', { fixture: 'orderResponse.json' }).as('postOrder');
    cy.get('.cartArea button').click();
    cy.wait('@postOrder');
    cy.contains('Yipee').should('be.visible').then(() => {
      cy.log('Order placed successfully');
    });
    cy.get('.cartArea h3').should('contain', 'Products: 0').then(() => {
      cy.log('Cart cleared successfully');
    });
  });
});
