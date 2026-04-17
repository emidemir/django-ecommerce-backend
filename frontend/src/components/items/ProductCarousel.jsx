import React from 'react';
import ProductCard from './ProductCard';
import '../../style/items/carousel.css';

const ProductCarousel = ({ products }) => {
  return (
    <div className="carousel-wrapper">
      <div className="carousel-track">
        {products.map(product => (
          <div className="carousel-item" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;