import { HeroSection } from '../components/HeroSection';
import { QuoteSection } from '../components/QuoteSection';
import { ShowcaseSection } from '../components/ShowcaseSection';
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
      <ShowcaseSection />
      <HowItWorksSection />
      <InvestmentSection />
      <BlogSection />
      <LoanCalculatorSection />
      <ContactSection />
    </>
  );
}
