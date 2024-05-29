import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasBought, setHasBought] = useState(false);
  const [orderId, setOrderId] = useState(null);

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
      .then(response => {
        setProducts(response.data);
        setError(null);
      })
      .catch(err => setError(err))
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
        providerId: 1,
        products: cart
      },
    }).then((response) => {
      setCart([]);
      setHasBought(true);
      setOrderId(response.data.id);
      setError(null);
    })
    .catch(err => setError(err));
  }

  return (
    <div className="App">
      <header className="App-header">
        {error ? <h1>{error.message}</h1> : null}
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
          <div className="bottom">
            <div className="cartArea">
              <h2>Cart</h2>
              <h3>Products: {cart.length}</h3>
              <button onClick={() => buyItems()}>Buy Items</button>
            </div>
            {hasBought ? <ReviewForm orderId={orderId} /> : null}
          </div>
        </>
      </header>
    </div>
  );
}

function ReviewForm({ orderId }) {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    await axios(`http://localhost:3000/review/${orderId}`, {
      method: 'POST',
      data: {
        clientId: 1,
        rating: parseInt(rating),
        comment: comment,
      },
    }).then(() => {
      setRating('');
      setComment('');
      setReviewSuccess(true);
      setReviewError(null);
    }).catch(err => setReviewError(err));
  };

  return (
    <div className="reviewForm">
      <h2>Leave a Review</h2>
      {reviewError ? <h3>Order has to be delivered first!</h3> : null}
      {reviewSuccess ? <h3>Review submitted successfully!</h3> : null}
      <form onSubmit={handleReviewSubmit}>
        <input
          type="number"
          placeholder="Rating (1-5)"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="1"
          max="5"
          required
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review here"
          required
        />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default App;
