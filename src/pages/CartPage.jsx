// src/pages/CartPage.jsx
import React from 'react';
import productsData from '../data/products';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
function CartPage() {

  const {cart, updateQuantity, removeFromCart} = useCart()
  // Calculate the total price of all items in the cart
  const calculateSubtotal = () => {
    let total = 0;
    cart.forEach(cartItem => {
      const product = productsData.find(p => p.id === cartItem.productId);
      if (product) {
        total += product.price*cartItem.quantity;
      }
    });
    {console.log(total)}
    return total;
  };

  const subtotal = calculateSubtotal();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Shopping Cart</h2>
      {cart.length === 0 ? (
        // Conditional rendering: If cart is empty
        <p style={{ textAlign: 'center', fontSize: '1.1em', marginTop: '30px' }}>Your cart is currently empty. Start shopping!</p>
      ) : (
        // If cart has items, display them
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map(cartItem => {
            // Find the full product details using the productId from the cartItem
            const product = productsData.find(p => p.id === cartItem.productId);

            // Render cart item only if product details are found
            return product ? (
              <div key={cartItem.productId} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
               
                <img src={product.imageUrl} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px' }} />
                <div style={{ flexGrow: '1' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{product.name}</h3>
                  <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>Price: ${product.price.toFixed(2)}</p>
                  <p style={{ margin: '0', fontWeight: 'bold' }}>Quantity: {cartItem.quantity}</p>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                  ${(product.price * cartItem.quantity).toFixed(2)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' }}
                  >
                    +
                  </button>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2em', minWidth: '80px', textAlign: 'right' }}>
                  ${(product.price * cartItem.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ) : null; // Don't render if product not found (shouldn't happen with our mock data)
            
          })}

          <div style={{ borderTop: '2px solid #ddd', paddingTop: '20px', marginTop: '20px', textAlign: 'right', fontSize: '1.4em', fontWeight: 'bold' }}>
            Subtotal: ${subtotal.toFixed(2)}
          </div>

          <Link to="/checkout" style={{ textDecoration: 'none', alignSelf: 'flex-end', marginTop: '20px' }}>
            <button style={{ background: '#28a745', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2em' }}>
              Proceed to Checkout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default CartPage;

