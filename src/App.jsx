// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
// Import the new App.css
import './App.css';

// Import our page components
import HomePage from './pages/homePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage'; 

// HeaderContent component (now uses CSS classes)
function HeaderContent() {
  const { totalCartItems } = useCart();
   const { isAuthenticated, user, logout } = useAuth(); // Use useAuth hook
  return (
    <header className="app-header"> {/* Use className */}
      <nav className="app-nav"> {/* Use className */}
        <Link to="/" className="app-nav a">Home</Link> {/* Use className */}
        <Link to="/cart" className="app-nav a">Cart</Link> {/* Use className */}
        {isAuthenticated? (
          <>
            <span className="app-nav-text">Hello, {user.username}!</span>
            <button onClick={logout} className="app-nav-button">Logout</button>
          </>
        ):(<Link to="/login" className="app-nav a">Login</Link>)}
      </nav>
      <div>
        Cart ({totalCartItems} items)
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <AuthProvider>

        <HeaderContent />

        <main className="app-main"> {/* Use className */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} /> {/* NEW ROUTE */}
          </Routes>
        </main>

        <footer className="app-footer"> {/* Use className */}
          <p>&copy; {new Date().getFullYear()} My E-commerce Store.</p>
        </footer>
        </AuthProvider>
      </CartProvider>
    </Router>
  );
}

export default App;