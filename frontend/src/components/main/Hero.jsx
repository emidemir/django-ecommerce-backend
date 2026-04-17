import React from 'react';
import '../../style/main/hero.css';

const Hero = ({ title, subtitle, ctaText, onCtaClick }) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button className="hero-cta" onClick={onCtaClick}>
          {ctaText}
        </button>
      </div>
    </section>
  );
};

export default Hero;