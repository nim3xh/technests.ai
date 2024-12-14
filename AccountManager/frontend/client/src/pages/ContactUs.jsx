import React, { useState } from 'react';
import { Button, TextInput, Textarea, ToggleSwitch } from 'flowbite-react';

export default function ContactUs() {
  const [isOrganization, setIsOrganization] = useState(false);

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-8">
        Have questions or need assistance? Reach out to us using the form below.
      </p>
      <form className="space-y-6">
        {/* Toggle Organization/Individual */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Individual</span>
            <ToggleSwitch
              checked={isOrganization}
              onChange={() => setIsOrganization(!isOrganization)}
              label="Organization"
            />
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isOrganization ? 'Organization Name' : 'Your Name'}
          </label>
          <TextInput
            type="text"
            id="name"
            name="name"
            placeholder={isOrganization ? 'Enter your organization name' : 'Enter your name'}
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <TextInput
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
          />
        </div>

        {/* Additional Field for Organization */}
        {isOrganization && (
          <div>
            <label htmlFor="contact-person" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Person
            </label>
            <TextInput
              type="text"
              id="contact-person"
              name="contact-person"
              placeholder="Enter the contact person's name"
            />
          </div>
        )}

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Message
          </label>
          <Textarea
            id="message"
            name="message"
            rows="4"
            placeholder="Write your message here"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center items-center">
        <Button gradientMonochrome='teal' className="px-6 py-3">
            Send Message
        </Button>
        </div>
      </form>
    </div>
  );
}
