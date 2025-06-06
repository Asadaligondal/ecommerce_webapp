import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from 'react-router-dom';

function CheckoutPage(){
    const {cart, removeFromCart, setCart} = useCart()

    // function to confirm order, after confirmation, we might generate a reciept, and empty the cart
    const handleConfirmOrder = () =>{
        alert("Thank You for Shoppiing with Us!!!!")
        // could make the cart empty
        setCart([])
    }


    //function to subtotal, might need to import productsdata
    const calculateTotal = () =>{
        let total = 0
        cart.forEach(item =>{
            total+=item.quantity
        })
        return total
    };
    const itemCount = calculateTotal()

    return(
         <div style={{ padding: '20px', maxWidth: '600px', margin: '40px auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <h2>Checkout</h2>
      {cart.length === 0 ? (
        <p style={{ fontSize: '1.1em', color: '#dc3545' }}>Your cart is empty. Please add items before checking out.</p>
      ) : (
        <>
          <p style={{ fontSize: '1.2em', marginBottom: '30px' }}>
            You are about to purchase **{itemCount} item(s)**.
            {/* In a real app, you'd show the monetary total here */}
            {/* E.g., You are about to purchase items totaling: ${subtotal.toFixed(2)} */}
          </p>

          <button
            onClick={handleConfirmOrder}
            style={{ background: '#28a745', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2em', marginBottom: '20px' }}
          >
            Confirm Order
          </button>
        </>
      )}


      <p style={{ marginTop: '30px' }}>
        <Link to="/cart" style={{ color: '#007bff', textDecoration: 'none' }}>&larr; Back to Cart</Link>
      </p>
    </div>
    )
}
export default CheckoutPage;