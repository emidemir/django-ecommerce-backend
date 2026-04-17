import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../components/main/Hero';
import '../../style/main/home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Hero 
        title="Modern Essentials for Your Lifestyle"
        subtitle="Discover our new collection with up to 30% off."
        ctaText="Shop Now"
        onCtaClick={() => navigate('/items')}
      />

      <section className="featured-categories">
        <h2>Shop by Category</h2>
        <div className="category-grid">
          <div className="category-card">Electronics</div>
          <div className="category-card">Accessories</div>
          <div className="category-card">Home & Living</div>
        </div>
      </section>
    </div>
  );
};

export default Home;