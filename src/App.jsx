import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Workflow from './components/Workflow';
import Features from './components/Features';
import Integrations from './components/Integrations';
import Scenarios from './components/Scenarios';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-primary selection:text-brand-dark">
      <Navbar />
      <Hero />
      <Workflow />
      <Features />
      <Integrations />
      <Scenarios />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
