import Features from "@/components/landing-page/Features";
import Footer from "@/components/landing-page/Footer";
import Hero from "@/components/landing-page/Hero";
import HowItWorks from "@/components/landing-page/HowItWork";
import Pricing from "@/components/landing-page/Pricing";
import Testimonials from "@/components/landing-page/Testimonial";
import React from "react";

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <Footer />
    </>
  );
};

export default Home;
