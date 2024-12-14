import React, { useState } from 'react';
import Footer from '../components/Footer';
import AboutUs from './AboutUs';
import ContactUs from './ContactUs';
import Services from './Services';
import { FaArrowRight } from "react-icons/fa";
import { Button, Container, Section, Typography } from 'flowbite-react';

export default function Home() {
  const [isDarkMode] = useState(false);
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Hero Section */}
      <Section id='home' className="bg-white dark:bg-gray-900">
        <Container>
          <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
            {/* Content Section */}
            <div className="mr-auto place-self-center lg:col-span-7">
              <Typography
                as="h1"
                className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white"
              >
                technests.ai
              </Typography>
              <Typography
                as="p"
                className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </Typography>
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
        </Container>
      </Section>

      {/* About Us Section */}
      <Section id="about-us" className="bg-gray-100 dark:bg-gray-800 py-12">
        <Container>
          <AboutUs />
        </Container>
      </Section>

      {/* Services Section */}
      <Section id="services" className="bg-white dark:bg-gray-900 py-12">
        <Container>
          <Services />
        </Container>
      </Section>

      {/* Contact Us Section */}
      <Section id="contact-us" className="bg-gray-100 dark:bg-gray-800 py-12">
        <Container>
          <ContactUs />
        </Container>
      </Section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
