// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
// icons
import { FaSearch, FaShoppingCart, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

// Import the new App.css
import './App.css';

// Import our page components
import HomePage from './pages/homePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage'; 
import AdminOrderList from './admin/AdminOrderList';
import AdminLoginPage from './admin/AdminLoginPage'; 
import AdminOrderDetail from './admin/AdminOrderDetail';
import AdminAddProduct from './admin/AdminAddProduct';
import AdminProductList from './admin/AdminProductList';
import AdminEditProduct from './admin/AdminEditProduct';

// HeaderContent component
function HeaderContent() {
  const { totalCartItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <header className="app-header">
      <nav className="app-nav">
        {/* Logo on the far left */}
        <Link to="/" className="logo">E-Com</Link>
        
        {/* Center navigation */}
        <div className="nav-center">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        
        {/* Right side navigation */}
        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <span className="app-nav-text">Hello, {user.username}!</span>
              <button onClick={logout} className="app-nav-button">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
          
          <Link to="/cart" className="cart-link">
            <FaShoppingCart className="cart-icon" />
            <span>Cart</span>
            {totalCartItems > 0 && ( 
              <span className="cart-badge">{totalCartItems}</span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <h4>E-Com Store</h4>
            <p>Your trusted online shopping destination. We provide quality products with exceptional customer service and fast delivery worldwide.</p>
            <div className="social-icons">
              <a href="#" className="social-icon"><FaFacebook /></a>
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
              <a href="#" className="social-icon"><FaLinkedin /></a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Products</a></li>
              <li><a href="#">Categories</a></li>
              <li><a href="#">Deals</a></li>
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Best Sellers</a></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
              <li><a href="#">Size Guide</a></li>
              <li><a href="#">Track Your Order</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="footer-section">
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for the latest deals and product updates.</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-button">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} E-Com Store. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <AuthProvider>
          <HeaderContent />

          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/orders" element={<AdminOrderList />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/orders" element={<AdminOrderList />} />
              <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
              <Route path="/admin/products/add" element={<AdminAddProduct />} />
              <Route path="/admin/products" element={<AdminProductList />} />
              <Route path="/admin/products/edit/:productId" element={<AdminEditProduct />} /> 
            </Routes>
          </main>

          <Footer />
        </AuthProvider>
      </CartProvider>
    </Router>
  );
}

export default App;