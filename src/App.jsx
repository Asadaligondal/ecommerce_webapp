import React from 'react'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
// Import our page components
import HomePage from './pages/homePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';

import CheckoutPage from './pages/CheckoutPage'


function HeaderContent(){
      const {totalCartItems} = useCart()

    return(
      <header style={{ padding: '20px', background: '#f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <nav>
          <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Home</Link>
          <Link to="/cart" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Cart</Link>
        </nav>
        <div>
          Cart ({totalCartItems} items)
        </div>
      </header>
      )

}
function App() {
  

  return (
    <Router>
      <CartProvider>
       <HeaderContent />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>

      <footer style={{ padding: '20px', background: '#f0f0f0', textAlign: 'center', marginTop: '40px', borderTop: '1px solid #ccc' }}>
        <p>&copy; {new Date().getFullYear()} My E-commerce Store.</p>
      </footer>
      </CartProvider>
    </Router>
  )
}

export default App
