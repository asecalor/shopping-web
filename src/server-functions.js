export const getAllProducts = async () => {
    try {
        const response = await fetch('http://localhost:3000/product');
        
        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error; // Re-throw the error so it can be handled further up the chain if needed
    }
};
