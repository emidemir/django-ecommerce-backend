import React from 'react';
import '../../style/items/categoryBar.css';

const categories = ["All", "Electronics", "Accessories", "Bags", "Home & Living"];

const CategoryBar = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="category-bar">
      {categories.map(cat => (
        <button 
          key={cat} 
          className={`category-item ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;