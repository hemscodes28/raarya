import { HeroSection } from '../components/HeroSection';
import { QuoteSection } from '../components/QuoteSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { InvestmentSection } from '../components/InvestmentSection';
import { PropertiesSection } from '../components/PropertiesSection';
import { BlogSection } from '../components/BlogSection';
import { LoanCalculatorSection } from '../components/LoanCalculatorSection';
import { ContactSection } from '../components/ContactSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <QuoteSection />
      <PropertiesSection />
      <HowItWorksSection />
      <InvestmentSection />
      <BlogSection />
      <LoanCalculatorSection />
      <ContactSection />
    </>
  );
}
