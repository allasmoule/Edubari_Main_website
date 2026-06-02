import React from "react";

export const metadata = {
  title: "Terms of Service | EduBari",
  description: "Terms of Service for the EduBari platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary/30 via-white to-primary/10 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-dark mb-6">
          Terms of Service
        </h1>
        
        <div className="prose prose-blue max-w-none text-dark/80">
          <p className="mb-4 text-sm font-medium">Last updated: June 2026</p>
          
          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">1. Agreement to Terms</h2>
          <p className="mb-4 leading-relaxed">
            By accessing or using EduBari, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">2. Use License</h2>
          <p className="mb-4 leading-relaxed">
            Permission is granted to temporarily download one copy of the materials (information or software) on EduBari's website 
            for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under 
            this license you may not:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on EduBari's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">3. Disclaimer</h2>
          <p className="mb-4 leading-relaxed">
            The materials on EduBari's website are provided on an 'as is' basis. EduBari makes no warranties, expressed or implied, 
            and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of 
            merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">4. Limitations</h2>
          <p className="mb-4 leading-relaxed">
            In no event shall EduBari or its suppliers be liable for any damages (including, without limitation, damages for loss of data 
            or profit, or due to business interruption) arising out of the use or inability to use the materials on EduBari's website, 
            even if EduBari or a EduBari authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">5. Revisions and Errata</h2>
          <p className="mb-4 leading-relaxed">
            The materials appearing on EduBari's website could include technical, typographical, or photographic errors. EduBari does not 
            warrant that any of the materials on its website are accurate, complete or current. EduBari may make changes to the materials 
            contained on its website at any time without notice.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">6. Governing Law</h2>
          <p className="mb-4 leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of Bangladesh and you irrevocably submit 
            to the exclusive jurisdiction of the courts in that location.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4 text-dark">7. Contact Us</h2>
          <p className="mb-4 leading-relaxed">
            If you have any questions about these Terms, please contact us at: <a href="mailto:support@edubari.bd" className="text-tertiary hover:underline">support@edubari.bd</a>
          </p>
        </div>
      </div>
    </div>
  );
}
