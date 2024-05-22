import { useEffect, useState } from 'react';
import './App.css';
import Yipee from './Yipee';

function App() {
  const MyProducts = [
  {
    id: 1,
    name: 'Product 1',
    price: 10.00
  },
  {
    id: 2,
    name: 'Product 2',
    price: 10.00
  },
  {
    id: 3,
    name: 'Product 3',
    price: 10.00
  },
  {
    id: 4,
    name: 'Product 4',
    price: 10.00
  },
  {
    id: 5,
    name: 'Product 5',
    price: 10.00
  }
]
  const [products, setProducts] = useState(MyProducts)
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [hasBought, setHasBought] = useState(false)
  
  const addToCart = (product) => {
    setCart([...cart, product])
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  useEffect(() => {
    if(searchTerm && searchTerm !== '') {
    const newProducts = products.filter(product => {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase())
    })
    setProducts(newProducts)
  } else {
    setProducts(MyProducts)}
  }, [products, searchTerm])

  return (
    <div className="App">
      {hasBought ? <Yipee /> : null}
      <header className="App-header">
        <input className='searchBar' type='text' placeholder='Search for products' onChange={(e) => handleSearch(e)} value={searchTerm}/>
        <div className='productList'>
          {products.map(product => (
            <div key={product.id} className='product'>
              <h3>{product.name}</h3>
              <h4>${product.price}</h4>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
        <div className='CartArea'>
          <h2>Cart</h2>
          <h3>Products: {cart.length}</h3>
          <button onClick={(e) => setHasBought(true)} >Buy Items.</button>
        </div>
      </header>
    </div>
  );
}

export default App;
