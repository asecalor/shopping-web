import { useEffect, useState } from 'react';
import './App.css';
import Yipee from './Yipee';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasBought, setHasBought] = useState(false);

  //cart is array of objects like {productId: 1, quantity: 1}
  const addToCart = (product) => {
    const productIndex = cart.findIndex((cartItem) => cartItem.productId === product.id);
    if (productIndex === -1) {
      setCart([...cart, { productId: product.id, quantity: 1 }]);
    } else {
      const newCart = [...cart];
      newCart[productIndex].quantity++;
      setCart(newCart);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  async function getAllProducts() {
    await axios('http://localhost:3000/product')
      .then(response => setProducts(response.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }

  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  async function buyItems() {
    axios('http://localhost:3000/order', {
      method: 'POST',
      data: {
        clientId: 1,
        providerId: 2,
        products: cart,
      },
    }).then(() => {
      setCart([]);
      setHasBought(true);
    })
    .catch(err => console.error(err));
  }
  return (
    <div className="App">
      <header className="App-header">
        {hasBought ? <Yipee /> : 
        <>
          <input
            className="searchBar"
            type="text"
            placeholder="Search for products"
            onChange={handleSearch}
            value={searchTerm}
          />
          <div className="carousel">
            <div className="productList">
              {loading ? <h1>Loading...</h1> : null}
              {!loading &&
                filteredProducts.map(product => (
                  <div key={product.id} className="product">
                    <h3>{product.name}</h3>
                    <button onClick={() => addToCart(product)}>Add to Cart</button>
                  </div>
                ))}
            </div>
          </div>
          <div className="CartArea">
            <h2>Cart</h2>
            <h3>Products: {cart.length}</h3>
            <button onClick={() => buyItems()}>Buy Items.</button>
          </div>
        </>
        }
      </header>
    </div>
  );
}

export default App;
