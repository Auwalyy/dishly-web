import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/customer/HeroSection";
import { StatsSection, CategoriesSection, FeaturedRestaurants, HowItWorks, AppDownload } from "@/components/customer/LandingSections";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <FeaturedRestaurants />
      <HowItWorks />
      <AppDownload />
      <Footer />
    </main>
  );
}
