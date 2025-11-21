import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Workflow from './components/Workflow';
import Features from './components/Features';
import Scenarios from './components/Scenarios';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div className="bg-brand-dark min-h-screen text-white font-sans selection:bg-brand-primary/30 selection:text-white">
        <Navbar />
        <Hero />
        <Features />
        <Workflow />
        <Scenarios />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
