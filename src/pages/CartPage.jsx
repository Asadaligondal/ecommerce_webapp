// src/pages/CartPage.jsx
import React from 'react';
import productsData from '../data/products';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Import the new CartPage.css
import './CartPage.css';

function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const calculateSubtotal = () => {
    let total = 0;
    cart.forEach(cartItem => {
      const product = productsData.find(p => p.id === cartItem.productId);
      if (product) {
        total += product.price * cartItem.quantity;
      }
    });
    return total;
  };

  const subtotal = calculateSubtotal();

  return (
    <div className="cart-page-container"> {/* Use className */}
      <h2 className="cart-page-title">Your Shopping Cart</h2> {/* Use className */}

      {cart.length === 0 ? (
        <p className="empty-cart-message"> {/* Use className */}
          Your cart is currently empty. <Link to="/" className="app-nav-link">Start shopping!</Link> {/* Reuse a global link class if appropriate */}
        </p>
      ) : (
        <div className="cart-items-list"> {/* Use className */}
          {cart.map(cartItem => {
            const product = productsData.find(p => p.id === cartItem.productId);

            return product ? (
              <div key={cartItem.productId} className="cart-item"> {/* Use className */}
                <Link to={`/products/${product.id}`} className="cart-item-link"> {/* Use className */}
                  <img src={product.imageUrl} alt={product.name} className="cart-item-image" /> {/* Use className */}
                  <div className="cart-item-info"> {/* Use className */}
                    <h3>{product.name}</h3>
                    <p>Price: ${product.price.toFixed(2)}</p>
                  </div>
                </Link>
                <div className="cart-item-quantity-controls"> {/* Use className */}
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    className="quantity-button"
                  >
                    -
                  </button>
                  <span className="cart-item-quantity">{cartItem.quantity}</span> {/* Use className */}
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    className="quantity-button primary" 
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total-price"> {/* Use className */}
                  ${(product.price * cartItem.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="remove-item-button" 
                >
                  Remove
                </button>
              </div>
            ) : null;
          })}

          <div className="cart-subtotal"> {/* Use className */}
            Subtotal: ${subtotal.toFixed(2)}
          </div>

          <Link to="/checkout" className="proceed-to-checkout-link"> {/* Use className */}
            <button className="proceed-to-checkout-button"> {/* Use className */}
              Proceed to Checkout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default CartPage;