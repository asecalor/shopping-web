describe('Product App Tests', () => {
  const baseUrl = 'http://localhost:3000';
  const warehouseUrl = 'http://localhost:3001';
  let productId, providerId, warehouseId, productId2, providerId2, orderId, clientId;

  function createProduct(name) {
    // Create a product
    cy.request('POST', `${baseUrl}/product`, { name: name }).then(response => {
      productId = response.body.id;

      // Create a provider
      cy.request('POST', `${baseUrl}/provider`, {
        name: 'Test Provider' + Date.now(),
        email: 'test@example.com' + Date.now(),
        lastName: 'Doe'
      }).then(providerResponse => {
        providerId = providerResponse.body.id;

        // Create a warehouse with the provider
        cy.request('POST', `${warehouseUrl}/warehouse`, {
          address: '123 Test Address',
          providerId: providerId
        }).then(warehouseResponse => {
          warehouseId = warehouseResponse.body.id;

          // Add the product to the warehouse
          cy.request('POST', `${warehouseUrl}/warehouse/${warehouseId}`, {
            productId: productId,
            stock: 10
          }).then(() => {
            // Combine the product with the provider
            cy.request('POST', `${baseUrl}/provider/${providerId}`, {
              productId: productId,
              price: 100
            });
          });
        });
      });
    });
  }

  function createProduct2(name) {
    // Create a second product
    cy.request('POST', `${baseUrl}/product`, { name: name }).then(response => {
      productId2 = response.body.id;

      // Create a second provider
      cy.request('POST', `${baseUrl}/provider`, {
        name: 'Test Provider 2' + Date.now(),
        email: 'test2@example.com' + Date.now(),
        lastName: 'Smith'
      }).then(providerResponse => {
        providerId2 = providerResponse.body.id;

        // Create a warehouse with the second provider
        cy.request('POST', `${warehouseUrl}/warehouse`, {
          address: '456 Test Address',
          providerId: providerId2
        }).then(warehouseResponse => {
          warehouseId = warehouseResponse.body.id;

          // Add the second product to the warehouse
          cy.request('POST', `${warehouseUrl}/warehouse/${warehouseId}`, {
            productId: productId2,
            stock: 10
          }).then(() => {
            // Combine the second product with the second provider
            cy.request('POST', `${baseUrl}/provider/${providerId2}`, {
              productId: productId2,
              price: 150
            });
          });
        });
      });
    });
  }

  function createClient() {
    cy.request('POST', `${baseUrl}/client`, {
      name: 'Test Client' + Date.now(),
      email: 'test@mail.com.ar' + Date.now(),
      lastName: 'Doe',
      address: '123 Test Address 123'
    }).then(response => {
      clientId = response.body.id;
    })}

  beforeEach(() => {
    createProduct('Test Product ' + Date.now());
    cy.visit('http://localhost:3003/');
  });

  afterEach(() => {
    // Clean up created data after each test
    if (productId) cy.request('DELETE', `${baseUrl}/product/${productId}`);
    if (providerId) cy.request('DELETE', `${baseUrl}/provider/${providerId}`);
    if (productId2) cy.request('DELETE', `${baseUrl}/product/${productId2}`); // Delete the second product
    if (providerId2) cy.request('DELETE', `${baseUrl}/provider/${providerId2}`); // Delete the second provider

    productId = providerId = warehouseId = productId2 = providerId2 = null;
  });

  it('should load the application and display initial state', () => {
    // Test logic
    cy.get('.product').should('have.length.greaterThan', 0).then(() => {
      cy.log('Products loaded successfully');
    });
  });

  it('should search for a product and display filtered results', () => {
    // Test logic
    cy.get('.searchBar').type('Test Product');
    cy.get('.product').should('exist').then(() => {
      cy.log('Product found successfully');
    });
  });

  it('should add a product to the cart and verify the cart updates', () => {
    // Test logic
    cy.get('.searchBar').type('Test Product');
    cy.get('.product').first().find('button').click();
    cy.get('.cartArea h3').should('contain', 'Products: 1').then(() => {
      cy.log('Product added to cart successfully');
    });
  });

  it('should notify if adding a product from a different provider', () => {
    createProduct2('Test Product 2 ');
    cy.visit('http://localhost:3003/');
    // Test logic
    cy.get('.searchBar').type('Test Product');
    cy.get('.product').first().find('button').click();
    cy.get('.searchBar').clear().type('Test Product 2');
    cy.get('.product').first().find('button').click();
      cy.contains('All products in the cart must be from the same provider.').should('be.visible').then(() => {
        cy.log('Notification displayed successfully');
      });
    });

  it('should buy items in the cart and verify success state', () => {
    createClient()
    // Test logic
    cy.get('.searchBar').type('Test Product');
    cy.get('.product').first().find('button').click();
    cy.get('.cartArea button').click();
    cy.wait(2000); // Assuming some delay for the order to complete
    cy.get('.cartArea h3').should('contain', 'Products: 0').then(() => {
      cy.log('Cart cleared successfully');
    });
  });

  it('should submit a review after the order is delivered', () => {
  // Step 1: Intercept the network call to get the order ID from the response
  cy.intercept('POST', 'http://localhost:3002/cart').as('createOrder');
  
  // Step 2: Search and add the product to the cart
  cy.get('.searchBar').type('Test Product');
  cy.get('.product').first().find('button').click();
  cy.get('.cartArea button').click();
  
  // Step 3: Wait for the network request and capture the order ID
  cy.wait('@createOrder').then(interception => {
    // Extract order ID from the response
    const orderId = interception.response.body.id;

    // Step 4: Change order status to DELIVERED
    cy.request('PUT', `http://localhost:3000/order/${orderId}`, {
      status: 'DELIVERED'
    }).then(() => {
      // Step 5: Submit a review
      cy.get('.reviewForm input[type="number"]').type(5);
      cy.get('.reviewForm textarea').type('Great product!');
      cy.get('.reviewForm button[type="submit"]').click();
      cy.contains('Review submitted successfully!').should('be.visible');
    });
  });
});
})