import React from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import Scenarios from './components/Scenarios';
import Pricing from './components/Pricing';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-primary selection:text-brand-dark">
      <Hero />
      <Features />
      <Scenarios />
      <Pricing />
      <Footer />
    </div>
  );
}

export default App;
