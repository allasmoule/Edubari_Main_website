import React from "react";

export const metadata = {
  title: "Privacy Policy | EduBari",
  description: "Privacy Policy for EduBari platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/10 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-dark mb-6">
          Privacy Policy
        </h1>
        
        <div className="prose prose-blue max-w-none text-dark/80">
          <p className="mb-4 text-sm font-medium">Last updated: June 2026</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">1. Introduction</h2>
          <p className="mb-4 leading-relaxed">
            Welcome to EduBari. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">2. The Data We Collect About You</h2>
          <p className="mb-4 leading-relaxed">
            We may collect, use, store and transfer different kinds of personal data about you, including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            <li><strong>Profile Data:</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">3. How We Use Your Personal Data</h2>
          <p className="mb-4 leading-relaxed">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">4. Data Security</h2>
          <p className="mb-4 leading-relaxed">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
            used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal 
            data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">5. Contact Us</h2>
          <p className="mb-4 leading-relaxed">
            If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:support@edubari.bd" className="text-tertiary hover:underline">support@edubari.bd</a>
          </p>
        </div>
      </div>
    </div>
  );
}
