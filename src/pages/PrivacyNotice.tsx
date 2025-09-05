import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyNotice = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Vantage home">
            <img src="/lovable-uploads/7dc6d80a-2f1f-4523-af0c-88abbde31835.png" alt="Vantage logo" className="h-6 md:h-7 w-auto" loading="eager" />
          </a>
          <Button asChild variant="outline" size="sm">
            <a href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Privacy Notice</h1>
          
          <div className="prose prose-lg max-w-none text-foreground">
            <h2 className="text-2xl font-semibold mb-4">1. INTRODUCTION AND OBJECTIVE</h2>
            <p className="mb-6">
              Vantage Technologies (Pty) Ltd, its subsidiaries and associate companies, Vantage Invest (Pty) Ltd and Vantage Nominees (RF) (Pty) Ltd (hereinafter collectively referred to as the Vantage Group), respects your privacy and is committed to protecting your personal information in compliance with the Protection of Personal Information Act, 2013 ("POPIA") and other applicable legislation. This Privacy Policy outlines how we collect, use, store, and protect personal information across the Vantage Group.
            </p>
            <p className="mb-6">
              As a responsible corporate group, we recognise the importance of safeguarding the privacy rights of individuals, including our customers, employees, business partners, and stakeholders. We are dedicated to ensuring that your personal information is processed lawfully, fairly, and transparently.
            </p>
            <p className="mb-8">
              This policy applies to all personal information processed by us, whether provided directly by you or obtained through interactions with us. Please take a moment to read this policy carefully to understand how we handle your information and the choices available to you regarding your personal data.
            </p>

            <h2 className="text-2xl font-semibold mb-4">2. DEFINITIONS</h2>
            <p className="mb-4">In this policy, unless the context indicates otherwise:</p>
            <p className="mb-4">
              <strong>Applicable legislation</strong> means all legislation that the Vantage Group must adhere to and includes, but is not limited to, the Protection of Personal Information Act No 4 of 2013 ("POPIA"), the Companies Act No 71 of 2008 ("Companies Act"), the Promotion of Access to Information Act No 2 of 2000 ("PAIA") and the Employment Equity Act No. 55 of 1998;
            </p>
            <p className="mb-4">
              <strong>Personal information</strong> means information relating to you that includes, but is not limited to:
            </p>
            <ul className="mb-4 ml-6 space-y-1">
              <li>a. information relating to race, gender, sex, pregnancy, marital status, national, ethnic or social origin, colour, sexual orientation, age, physical or mental health, well-being, disability, religion, conscience, belief, culture, language and birth;</li>
              <li>b. information relating to education, medical, financial, criminal or employment history;</li>
              <li>c. any identifying number, symbol, e-mail address, physical address, telephone number, location information, online identifier or other particular assignment to you;</li>
              <li>d. biometric information;</li>
              <li>e. personal opinions, views or preferences;</li>
              <li>f. correspondence sent by you that is implicitly or explicitly of a private or confidential nature or further correspondence that would reveal the contents of the original correspondence.</li>
              <li>g. your views or opinions of another individual; and h. your name, if it appears with other personal information relating to you or if the disclosure of your name itself would reveal information about you;</li>
              <li>i. religious or philosophical beliefs, race or ethnic origin, trade union membership, political persuasion, health or sex life or biometric information.</li>
              <li>j. criminal behaviour to the extent that such information relates to:</li>
              <li>k. alleged commission of any offence; or</li>
              <li>l. any proceedings in respect of any offence allegedly committed by you or the disposal of such proceedings;</li>
            </ul>
            <p className="mb-4">
              <strong>Processing</strong> means any activity concerning personal information including:
            </p>
            <ul className="mb-4 ml-6 space-y-1">
              <li>a. collecting, receiving, recording, organising, collating, storing, updating, modifying, retrieving, altering, consulting or using;</li>
              <li>b. dissemination by means of transmission, distribution or making available in any other form; and/or</li>
              <li>c. merging, linking, restricting, degrading, erasing, or destroying information;</li>
            </ul>
            <p className="mb-8">
              <strong>We/us/Vantage Group</strong> means Vantage Group (Pty) Ltd and its subsidiaries mentioned above;
            </p>

            <h2 className="text-2xl font-semibold mb-4">3. HOW WE COLLECT YOUR PERSONAL INFORMATION</h2>
            <p className="mb-4">
              3.1 In accordance with POPIA, we collect personal information lawfully and fairly. We ensure that the collection of personal information is necessary and relevant to the purpose for which it is being collected. The types of personal information we collect depend on your interactions with us and may include, but are not limited to, the following:
            </p>
            <ul className="mb-4 ml-6 space-y-1">
              <li>• Contact details (e.g., name, email address, telephone number)</li>
              <li>• Identification information (e.g., ID or passport number)</li>
              <li>• Financial information (e.g., source of funds, bank details)</li>
              <li>• Employment or demographic details (where applicable)</li>
            </ul>
            <p className="mb-4">3.2 We collect personal information directly from you, unless:</p>
            <ul className="mb-4 ml-6 space-y-1">
              <li>• You have provided consent for collection from other sources;</li>
              <li>• The information is publicly available or contained in public records;</li>
              <li>• Collection from another source is necessary to maintain our legitimate interests or to comply with legal obligations; or</li>
              <li>• It is otherwise authorised by law.</li>
            </ul>
            <p className="mb-4">3.3 Personal information may be collected through various channels, including:</p>
            <ul className="mb-8 ml-6 space-y-1">
              <li>• When you provide it directly to us through forms, contracts, or other correspondence;</li>
              <li>• When you interact with our websites, mobile applications, or other digital platforms;</li>
              <li>• Through third parties with your consent, or as permitted by law.</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">4. HOW WE USE YOUR COLLECTED PERSONAL INFORMATION</h2>
            <p className="mb-4">
              4.1 Personal information is processed to support our business operations, provide services, and meet legal and regulatory requirements. This may include, but is not limited to, using personal information for:
            </p>
            <ul className="mb-4 ml-6 space-y-1">
              <li>• Fulfilling contractual obligations;</li>
              <li>• Communicating with you regarding our services or updates;</li>
              <li>• Responding to inquiries or requests;</li>
              <li>• Conducting administrative, financial, and operational activities;</li>
              <li>• Managing our relationship with you, including for customer service or support;</li>
              <li>• Complying with legal obligations and enforcing legal rights.</li>
            </ul>
            <p className="mb-4">
              4.2 Where we intend to use your personal information for a further purpose that is not compatible with the original purpose, we will notify you and obtain your consent, where necessary.
            </p>
            <p className="mb-4">
              4.3 We ensure that personal information is used in a manner that is relevant, adequate, and not excessive for the purposes for which it is processed.
            </p>
            <p className="mb-8">
              4.4 If you inform the Vantage Group that you do not want us to continue using your personal information, we will stop doing so, subject to any legal obligations that may apply.
            </p>

            <h2 className="text-2xl font-semibold mb-4">5. DISCLOSURE OF YOUR PERSONAL INFORMATION</h2>
            <p className="mb-4">
              5.1 We will only disclose your personal information to third parties when it is lawful and necessary to do so. Personal information may be shared with our subsidiaries, service providers, business partners, or other third parties for legitimate business purposes, including the provision of financial services, administrative support, or to fulfil contractual obligations. We ensure that any third party receiving personal information from us is bound by appropriate confidentiality and data protection agreements and will only process your personal information for the purposes for which it was disclosed.
            </p>
            <p className="mb-4">5.2 We may also disclose your personal information under the following circumstances:</p>
            <ul className="mb-4 ml-6 space-y-1">
              <li>• With your express consent;</li>
              <li>• When required or permitted by law or a court order;</li>
              <li>• To protect our legitimate interests, or the interests of others;</li>
              <li>• To government authorities, regulatory bodies, or law enforcement agencies where necessary to comply with legal or regulatory obligations.</li>
            </ul>
            <p className="mb-8">
              5.3 We may transfer your personal information to third parties who conduct business in another country, including countries which may not have data privacy legislation similar to those of the Republic of South Africa. Should this happen, we will ensure that anyone to whom we transfer your personal information agrees to treat your information with the same level of protection as we offer.
            </p>

            <h2 className="text-2xl font-semibold mb-4">6. RETENTION OF YOUR PERSONAL INFORMATION</h2>
            <p className="mb-8">
              We retain personal information only for as long as it is necessary to fulfil the purposes for which it was collected, or as required by law, in accordance with POPIA. Once the personal information is no longer needed, we will either delete, destroy, or de-identify it in a manner that ensures it cannot be reconstructed or read. Retention periods may vary depending on the nature of the information and the legal or operational requirements associated with it. Where required by law, we may retain certain information for prescribed periods, such as for tax, audit, or compliance purposes. You may request that we delete your personal information at any time, subject to applicable legal and contractual obligations.
            </p>

            <h2 className="text-2xl font-semibold mb-4">7. ACCESS TO, CORRECTION AND DELETION OF YOUR PERSONAL INFORMATION</h2>
            <p className="mb-4">
              7.1 You have the right to request access to, correction of, or destruction of your personal information held by us. Should you wish to exercise any of these rights, please submit a formal request in accordance with the procedures outlined in our Promotion of Access to Information Act ("PAIA") Manual. The PAIA Manual provides detailed steps on how to submit requests, the required forms, and the applicable timeframes for processing such requests.
            </p>
            <p className="mb-4">7.2 You may request access to your personal information to verify its accuracy and lawfulness of processing;</p>
            <ul className="mb-4 ml-6 space-y-1">
              <li>• Correction or updating of your personal information if it is inaccurate, outdated, or incomplete; or</li>
              <li>• The destruction or deletion of personal information that is no longer required for the purpose it was collected or where processing is unlawful.</li>
            </ul>
            <p className="mb-8">
              • Requests may be subject to verification and applicable fees as provided for in our PAIA Manual. You can obtain a copy of our PAIA Manual by contacting us using the details below or by visiting our website (www.vantage.co.za)
            </p>

            <h2 className="text-2xl font-semibold mb-4">8. AMENDMENTS TO THIS POLICY</h2>
            <p className="mb-4">The Vantage Group Executive Committee may amend this policy from time to time for any of the following reasons:</p>
            <ul className="mb-4 ml-6 space-y-1">
              <li>8.1.1 to provide for the introduction of new systems, methods of operation, products, services, offerings or facilities;</li>
              <li>8.1.2 to comply with changes to any applicable legislation;</li>
              <li>8.1.3 to ensure that our policy is clearer and more favourable to you;</li>
              <li>8.1.4 to rectify any mistake that may be discovered; and/or</li>
              <li>8.1.5 any other reason which Vantage Group, in its sole discretion, may deem reasonable or necessary.</li>
            </ul>
            <p className="mb-8">
              8.2 Any such amendment becomes effective in any agreement you have with the Vantage Group when notice thereof is given by publication on our website (www.vantage.co.za). It is your responsibility to check the website frequently.
            </p>

            <h2 className="text-2xl font-semibold mb-4">9. COMPLAINTS</h2>
            <p className="mb-4">
              Should you believe that the Vantage Group has used your personal information contrary to applicable legislation, you undertake to first attempt to resolve any concerns with Vantage Group. You may lodge a complaint by sending an email to hello@vantage.co.za. If you are not satisfied with the outcome of your complaint, you may have the right to lodge a complaint with the Information Regulator using the following contact details:
            </p>
            <p className="mb-4">Email: POPIAcomplaints@inforegulator.org.za</p>
            <p className="mb-8">Website: https://www.justice.gov.za/inforeg/</p>

            <h2 className="text-2xl font-semibold mb-4">10. CONTACT US</h2>
            <p className="mb-4">
              If you have any comments or questions about this policy, please contact our Chief Compliance Officer, at hello@vantage.co.za.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyNotice;