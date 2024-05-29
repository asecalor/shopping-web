describe('Product App Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001/');
  });

  it('should load the application and display initial state', () => {
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
    const searchTerm = 'Plays'; // Replace with an actual product name from your database
    cy.get('.searchBar').type(searchTerm);
    cy.get('.product').should('exist').first().find('button').click();
    cy.get('.cartArea button').click();
    cy.contains('Review (only when delivered)').should('be.visible');
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
