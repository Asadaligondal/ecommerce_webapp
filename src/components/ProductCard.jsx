import react from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext';
function ProductCard({ product}) {
  const {addToCart} = useCart()
  return (
    
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', height: '150px', objectFit: 'contain', marginBottom: '10px' }} />
        <h3>{product.name}</h3>
        <p>${product.price.toFixed(2)}</p>
      </Link>
      <button onClick={() =>addToCart(product)} 
      style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
        Add to Cart
      </button>
    </div>
  );
}
export default ProductCard;