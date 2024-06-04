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
  const [notification, setNotification] = useState('');

  const addToCart = (product) => {
    if (cart.length > 0 && cart[0].providerId !== product.providerId) {
      setNotification('All products in the cart must be from the same provider.');
      return;
    }
    const productIndex = cart.findIndex((cartItem) => cartItem.productId === product.productId);
    if (productIndex === -1) {
      setCart([...cart, { productId: product.productId, quantity: 1, providerId: product.providerId }]);
    } else {
      const newCart = [...cart];
      newCart[productIndex].quantity++;
      setCart(newCart);
    }
    setNotification('');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  async function getAllProducts() {
    await axios('http://localhost:3000/product/provider')
      .then(response => {
        setProducts(response.data);
        setError(null);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }

  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  async function buyItems() {
    if (cart.length === 0) {
      setNotification('Cart is empty!');
      return;
    };
    setNotification('');

    axios('http://localhost:3002/cart', {
      method: 'POST',
      data: {
        clientId: 1,
        providerId: cart[0].providerId,
        products: cart.map(({ productId, quantity }) => ({ productId, quantity }))
      },
    }).then((response) => {
      if(response.statusCode) {
        setError(response.message);
        return;
      }
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
        {notification ? <h2>{notification}</h2> : null}
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
                  <div key={product.productId} className="product">
                    <h3>{product.productName}</h3>
                    <p>Provider: {product.providerName} {product.providerLastName}</p>
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
      <h2>Thanks for ordering!</h2>
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
