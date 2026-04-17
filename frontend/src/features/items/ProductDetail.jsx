import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../style/items/productDetail.css';
import ReviewSection from '../reviews/ReviewSection';
import RelatedProducts from '../recommendations/RelatedProducts';

// In a real app, you'd fetch this from an API using the ID
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data lookup
  const product = {
    id: id,
    name: 'Minimalist Watch',
    price: 120,
    description: 'A premium timepiece designed for those who appreciate simplicity and elegance. Featuring a genuine leather strap and a scratch-resistant glass face.',
    features: ['Water resistant', '2-year warranty', 'Genuine Leather'],
    image: 'https://via.placeholder.com/500'
  };

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Products</button>
      
      <div className="detail-container">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="detail-info">
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-price">${product.price}</p>
          <p className="detail-description">{product.description}</p>
          
          <div className="detail-features">
            <h4>Key Features:</h4>
            <ul>
              {product.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>

          <div className="detail-actions">
            <div className="qty-selector">
              <label>Quantity</label>
              <input type="number" defaultValue="1" min="1" />
            </div>
            <button className="buy-now-btn">Add to Cart</button>
          </div>
        </div>
      </div>

      <ReviewSection productId={id} />
      <RelatedProducts category={product.category} />
    </div>
  );
};

export default ProductDetail;