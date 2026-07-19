import { HeroSection } from '../components/HeroSection';
import { QuoteSection } from '../components/QuoteSection';
import { CategoryExplorerSection } from '../components/CategoryExplorerSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { InvestmentSection } from '../components/InvestmentSection';
import { BlogSection } from '../components/BlogSection';
import { LoanCalculatorSection } from '../components/LoanCalculatorSection';
import { ContactSection } from '../components/ContactSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <QuoteSection />
      <CategoryExplorerSection />
      <HowItWorksSection />
      <InvestmentSection />
      <BlogSection />
      <LoanCalculatorSection />
      <ContactSection />
    </>
  );
}
