import { HeroSection } from "@/components/arcane-chess/hero-section"
import { FeaturesSection } from "@/components/arcane-chess/features-section"
import { GameModesSection } from "@/components/arcane-chess/game-modes-section"
import { AICoachSection } from "@/components/arcane-chess/ai-coach-section"
import { PremiumSection } from "@/components/arcane-chess/premium-section"
import { CTASection } from "@/components/arcane-chess/cta-section"
import { Footer } from "@/components/arcane-chess/footer"
import { GlobalParticles } from "@/components/arcane-chess/global-particles"
import { Header } from "@/components/arcane-chess/header"

export default function ArcaneChessLanding() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <Header />
      {/* Subtle global pixel particles across the whole page */}
      <GlobalParticles />
      <HeroSection />
      <FeaturesSection />
      <GameModesSection />
      <AICoachSection />
      <PremiumSection />
      <CTASection />
      <Footer />
    </main>
  )
}

