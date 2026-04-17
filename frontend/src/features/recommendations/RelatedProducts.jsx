import React from 'react';
import ProductCarousel from '../../components/items/ProductCarousel';
import '../../style/items/carousel.css'; 

// Mock data (In a real app, you'd fetch this based on category)
const MOCK_PRODUCTS = [
  { id: 101, name: 'Classic Chrono', price: 150, category: 'Accessories', image: 'https://via.placeholder.com/150' },
  { id: 102, name: 'Gold Mesh Watch', price: 180, category: 'Accessories', image: 'https://via.placeholder.com/150' },
  { id: 103, name: 'Leather Wallet', price: 45, category: 'Accessories', image: 'https://via.placeholder.com/150' },
  { id: 104, name: 'Silver Cuff', price: 60, category: 'Accessories', image: 'https://via.placeholder.com/150' },
];

const RelatedProducts = ({ category }) => {
  return (
    <section className="related-products">
      <h3 className="section-title">You Might Also Like</h3>
      <ProductCarousel products={MOCK_PRODUCTS} />
    </section>
  );
};

export default RelatedProducts;