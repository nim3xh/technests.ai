import React, { useState } from 'react';

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
          <button
            type="button"
            onClick={() => setIsOrganization(false)}
            className={`px-4 py-2 rounded-l-lg ${!isOrganization ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => setIsOrganization(true)}
            className={`px-4 py-2 rounded-r-lg ${isOrganization ? 'bg-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Organization
          </button>
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isOrganization ? 'Organization Name' : 'Your Name'}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            placeholder={isOrganization ? 'Enter your organization name' : 'Enter your name'}
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            placeholder="Enter your email"
          />
        </div>

        {/* Additional Field for Organization */}
        {isOrganization && (
          <div>
            <label htmlFor="contact-person" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Person
            </label>
            <input
              type="text"
              id="contact-person"
              name="contact-person"
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              placeholder="Enter the contact person's name"
            />
          </div>
        )}

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Message
          </label>
          <textarea
            id="message"
            name="message"
            rows="4"
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            placeholder="Write your message here"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
