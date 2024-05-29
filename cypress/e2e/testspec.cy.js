describe('Product App Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3002/');
  });

  it('should load the application and display initial state', () => {
    cy.intercept('GET', 'http://localhost:3000/product').as('getProducts');
    cy.visit('http://localhost:3002/');
    cy.wait('@getProducts').its('response.statusCode').should('be.oneOf', [200, 304]);
    cy.get('.product').should('have.length.greaterThan', 0).then(() => {
      cy.log('Products loaded successfully');
    });
  });

  it('should search for a product and display filtered results', () => {
    const searchTerm = 'Plays'; // Replace with an actual product name from your database
    cy.get('.searchBar').type(searchTerm);
    cy.get('.product').should('exist').each((product) => {
      cy.wrap(product).contains(searchTerm, { matchCase: false });
    }).then(() => {
      cy.log('Search results displayed successfully');
    });
  });

  it('should add a product to the cart and verify the cart updates', () => {
    const searchTerm = 'Plays'; // Replace with an actual product name from your database
    cy.get('.searchBar').type(searchTerm);
    cy.get('.product').should('exist').first().find('button').click();
    cy.get('.cartArea h3').should('contain', 'Products: 1').then(() => {
      cy.log('Product added to cart successfully');
    });
  });

  it('should buy items in the cart and verify success state', () => {
    cy.intercept('POST', 'http://localhost:3000/order').as('postOrder');
    const searchTerm = 'Plays'; // Replace with an actual product name from your database
    cy.get('.searchBar').type(searchTerm);
    cy.get('.product').should('exist').first().find('button').click();
    cy.get('.cartArea button').click();
    cy.wait('@postOrder').then((interception) => {
      assert.isObject(interception.response.body, 'Response body is an object');
      assert.containsAllKeys(interception.response.body, ['id', 'providerId', 'clientId', 'totalAmount', 'status', 'address', 'products'], 'Response body contains all required keys');
      assert.equal(interception.response.body.status, 'PENDING', 'Order status is PENDING');
      cy.log('Order created successfully');
    });

    cy.contains('Leave a Review').should('be.visible');
    cy.get('.cartArea h3').should('contain', 'Products: 0').then(() => {
      cy.log('Cart cleared successfully');
    });

    // You can further extend this test to simulate review submission only works if mocked -- order status has to be changed
    // cy.get('.reviewForm input[type="number"]').type(5);
    // cy.get('.reviewForm textarea').type('Great product!');
    // cy.get('.reviewForm button[type="submit"]').click();
    // cy.contains('Review submitted successfully!').should('be.visible');
  });
});
