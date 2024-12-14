import React, { useState } from 'react';
import { Link } from 'react-scroll';  // Importing Link component from react-scroll
import { useInView } from 'react-intersection-observer';  // Importing Intersection Observer
import Footer from '../components/Footer';
import AboutUs from './AboutUs';
import ContactUs from './ContactUs';
import Services from './Services';
import { FaArrowRight } from "react-icons/fa";
import { Button } from 'flowbite-react';

export default function Home() {
  const [isDarkMode] = useState(false);

  // Intersection Observer hooks for animations
  const { ref: aboutUsRef, inView: aboutUsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: servicesRef, inView: servicesInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: contactUsRef, inView: contactUsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Hero Section */}
      <section id='home' className="bg-white dark:bg-gray-900">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
          {/* Content Section */}
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">
              technests.ai
            </h1>
            <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button gradientMonochrome="teal" className="text-white" outline>
                Get Started
                <FaArrowRight className="w-5 h-5 ml-2 -mr-1" />
              </Button>
            </div>
          </div>
          {/* Image Section */}
          <div className="hidden lg:flex lg:mt-0 lg:col-span-5">
            <img
              src="https://www.daytrading.com/wp-content/uploads/2021/09/StreamsFX-Mobile-1.png"
              alt="Phone Mockup"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Navigation Links for smooth scrolling */}
      <nav className="fixed top-0 left-0 w-full bg-gray-800 bg-opacity-80 p-4 z-10">
        <div className="flex justify-center space-x-6">
          <Link to="about-us" smooth={true} duration={1000} className="text-white cursor-pointer">
            About Us
          </Link>
          <Link to="services" smooth={true} duration={1000} className="text-white cursor-pointer">
            Services
          </Link>
          <Link to="contact-us" smooth={true} duration={1000} className="text-white cursor-pointer">
            Contact Us
          </Link>
        </div>
      </nav>

      {/* About Us Section with Enhanced Animation */}
      <section
        ref={aboutUsRef}
        id="about-us"
        className={`bg-gray-100 dark:bg-gray-800 py-12 transition-all duration-1000 ease-out opacity-0 transform ${aboutUsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <AboutUs />
        </div>
      </section>

      {/* Services Section with Enhanced Animation */}
      <section
        ref={servicesRef}
        id="services"
        className={`bg-white dark:bg-gray-900 py-12 transition-all duration-1000 ease-out opacity-0 transform ${servicesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <Services />
        </div>
      </section>

      {/* Contact Us Section with Enhanced Animation */}
      <section
        ref={contactUsRef}
        id="contact-us"
        className={`bg-gray-100 dark:bg-gray-800 py-12 transition-all duration-1000 ease-out opacity-0 transform ${contactUsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <ContactUs />
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
