import dynamic from "next/dynamic";

import PopularCoursesSection from "@/app/(HomePageComponents)/(CourseCarousel)/PopularCoursesSection.tsx";
import HeroSection from "@/app/(HomePageComponents)/(HeroSection)/HeroSection";
import StatsSection from "@/app/(HomePageComponents)/(StatsSection)/StatsSection.tsx";
import { CategoriesSectionAnimated } from "@/app/(HomePageComponents)/CategoriesSectionAnimated";
import { CertificateSectionSimple } from "@/app/(HomePageComponents)/CertificateSectionSimple";
import { InstructorsSectionAdvanced } from "@/app/(HomePageComponents)/InstructorsSectionAdvanced";
import { WhyLearnSectionAnimated } from "@/app/(HomePageComponents)/WhyLearnSectionAnimated";
import BackToTop from "@/components/shared/BackToTop";
import TabletDrawer from "@/components/shared/menu/TabletDrawer";
import GCommunitySection from "../(HomePageComponents)/(CommunitySection)/GCommunitySection.tsx";
import ProcessPerfect from "../(HomePageComponents)/(Process)/Process.tsx";
import TestimonialSlider from "../(HomePageComponents)/(TestimonialSection)/TestimonialSlider";
import FAQStickyStack from "../(HomePageComponents)/FAQStickyStack.tsx";
import StdTestimonials from "../(HomePageComponents)/StdTestimonials.tsx";
import { DiscoverBooksSectionCarousel } from "../(HomePageComponents)/DiscoverBooksSectionCarousel.tsx";

const MobileMenuWrapper = dynamic(() => import("../(HomePageComponents)/MobileMenuWrapper.tsx"));

const ContactSection = dynamic(
  () => import("../(HomePageComponents)/(ContactSection)/ContactSection.tsx")
);

export default function HomePage() {
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
      <MobileMenuWrapper />
      <TabletDrawer />
      <BackToTop />
    </>
  );
}
