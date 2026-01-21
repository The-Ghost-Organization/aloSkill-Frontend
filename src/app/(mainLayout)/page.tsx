"use client";

import GCommunitySection from "@/app/(HomePageComponents)/(CommunitySection)/GCommunitySection.tsx";
import PopularCoursesSection from "@/app/(HomePageComponents)/(CourseCarousel)/PopularCoursesSection.tsx";
import HeroSection from "@/app/(HomePageComponents)/(HeroSection)/HeroSection";
import StatsSection from "@/app/(HomePageComponents)/(StatsSection)/StatsSection.tsx";
import { CategoriesSectionAnimated } from "@/app/(HomePageComponents)/CategoriesSectionAnimated";
import { CertificateSectionSimple } from "@/app/(HomePageComponents)/CertificateSectionSimple";
import { DiscoverBooksSectionCarousel } from "@/app/(HomePageComponents)/DiscoverBooksSectionCarousel";
import { InstructorsSectionAdvanced } from "@/app/(HomePageComponents)/InstructorsSectionAdvanced";
import { WhyLearnSectionAnimated } from "@/app/(HomePageComponents)/WhyLearnSectionAnimated";

import BackToTop from "@/components/shared/BackToTop";
import MobileMenu from "@/components/shared/menu/MobileMenu";
import TabletDrawer from "@/components/shared/menu/TabletDrawer";
import { useState } from "react";
import ContactSection from "../(HomePageComponents)/(ContactSection)/ContactSection.tsx";
import TestimonialSlider from "../(HomePageComponents)/(TestimonialSection)/TestimonialSlider.tsx";
import FAQStickyStack from "../(HomePageComponents)/FAQStickyStack.tsx";
import ProcessPerfect from "../(HomePageComponents)/Process.tsx";
import StdTestimonials from "../(HomePageComponents)/StdTestimonials.tsx";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <HeroSection />
      <StatsSection />
      <CategoriesSectionAnimated />
      <WhyLearnSectionAnimated />
      <PopularCoursesSection />
      <DiscoverBooksSectionCarousel />
      <InstructorsSectionAdvanced />
      <StdTestimonials />
      <ProcessPerfect />
      <FAQStickyStack />
      <TestimonialSlider />
      <GCommunitySection />
      <CertificateSectionSimple />
      <ContactSection />
      {/* <Newsletter /> */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <TabletDrawer />
      <BackToTop />
    </>
  );
}
