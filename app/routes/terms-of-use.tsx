import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsOfUse = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Terms of Use</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">INTRODUCTION</h2>
              <p>
                These Terms of Use ("Terms") govern your access to and use of all digital platforms owned and operated by the Vantage Technologies (Pty) Ltd ("Vantage Group"), a private company registered in the Republic of South Africa (registration number 2001/005392/07) with its principal place of business at Silverstream Business Park Muswell Road, Bryanston, South Africa.
              </p>
              <p>
                The Vantage Group is a holding company providing diversified financial services through its subsidiaries, all of which use the Vantage Group's digital platforms to deliver their respective services. By accessing or using any of these digital platforms, you agree to comply with these Terms, which apply across the Vantage Group and its subsidiaries, including:
              </p>
              <ul className="list-disc ml-6">
                <li>Vantage Invest (Pty) Ltd</li>
                <li>Vantage Nominees (RF) (Pty) Ltd</li>
              </ul>
              <p>
                These subsidiaries utilise the Vantage Group's digital platforms to provide information and resources, and give access to services to clients within the financial services industry.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">CONDITIONS AND ACCEPTANCE</h2>
              <p>
                By accessing our digital platforms, you acknowledge that you have read, understood, and expressly agreed to these Terms. In the event that you do not agree to the terms and conditions, please do not continue using the digital platform. We reserve the right to amend these Terms at any time. Any changes will be posted on our digital platforms and will become effective upon posting. Continued use of our platforms signifies acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">JURISDICTION</h2>
              <p>
                These Terms are governed by the laws of the Republic of South Africa, and any disputes arising from the use of our digital platforms will be resolved in South African courts. This does not, however, restrict, or purport to restrict, your right to submit a complaint to any other body in terms of applicable law, including consumer and financial services laws which cannot be altered by contract.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">ACCESS AND AVAILABILITY</h2>
              <p>
                Subject to these Terms, we grant you a limited, non-exclusive, and non-transferable right to access and use the platform for its intended purpose. Access to the platform may be restricted, suspended, or terminated at our sole discretion for reasons including, but not limited to, maintenance, updates, security concerns, or violations of these Terms. While we strive to provide continuous, uninterrupted access to the platform, we do not guarantee that the platform will always be available or free of errors. You acknowledge that the platform may experience downtime or service interruptions owing to maintenance, system failures, or unforeseen technical issues beyond our control.
              </p>
              <p>
                We reserve the right to perform scheduled maintenance on the platform. Whenever possible, we will provide prior notice of such maintenance, though we are not obligated to do so. Maintenance may temporarily affect your ability to access certain features or services.
              </p>
              <p>
                In the event of unexpected service interruptions or technical difficulties, we will make reasonable efforts to restore access as soon as possible. However, we do not accept liability for any losses or damages resulting from such interruptions.
              </p>
              <p>
                We reserve the right to suspend or restrict your access to the platform at any time and for any reason, including in cases of suspected misuse, illegal activity, or non-compliance with these Terms. Any such action may be taken without prior notice, and we are under no obligation to restore access to users who violate these Terms.
              </p>
              <p>
                You are responsible for ensuring that your device and Internet connection meet the minimum requirements necessary for accessing and using the platform. We are not responsible for any issues caused by your device or network setup.
              </p>
              <p>
                Any of our digital platforms may be accessed using a mobile device and these Terms apply regardless of the manner of your access or chosen device or browser. The Vantage Group is not responsible for the wireless services used by your mobile devices and disclaims any responsibility for the lack of functionality of any mobile device or software used to access any of our digital platforms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">NATURE OF INFORMATION AND DISCLAIMER</h2>
              <p>
                All content on our digital platforms is provided for general informational purposes only and is not intended as professional advice. We strive to ensure accuracy but cannot guarantee it. You should consult a qualified financial advisor for advice tailored to your specific needs. Some information displayed is based on details provided by our clients and from third parties. As we do not control third-party information, we make no representations or warranties regarding its accuracy, appropriateness, or correctness.
              </p>
              <p>
                Regarding our financial calculators: All values shown are indicative, based solely on the information provided. Past performance does not indicate future performance, and investment returns are not guaranteed. These calculators are not substitutes for professional financial planning tools.
              </p>
              <p>
                Regarding financial advice: Any views or opinions presented on our digital platforms are solely those of the individual advisor and do not necessarily represent the Vantage Group's views. Any actions taken based on this content are at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">ONUS OF PROOF AND RETENTION OF RECORDS</h2>
              <p>
                You agree that it is your responsibility to provide adequate proof of any transactions, interactions, or activities conducted on the digital platform. The Vantage Group may, at its discretion, request such proof to resolve any disputes or issues arising from the use of the platform. The Vantage Group will retain records of transactions, communications, and other activities conducted through the digital platform for a period in accordance with applicable laws and regulations. While we take reasonable measures to ensure the security and integrity of our records, we do not guarantee the retention of all records indefinitely. You acknowledge and accept that, in the event of any dispute, the records maintained by the Vantage Group will be deemed conclusive evidence of the transactions and activities conducted through the platform, unless you can provide verifiable proof to the contrary.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">NO OFFER</h2>
              <p>
                No information or content contained in any of our digital platforms should be interpreted as an offer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">COOKIES</h2>
              <p>
                We use cookie technology on all of our digital platforms. It helps the digital platforms to remember information about your device and how you use these digital platforms. You can set your browser to notify you when you receive a cookie giving you the chance to decide whether to accept it or not.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">PRIVACY NOTICE</h2>
              <p>
                Your privacy is important to us. Our Privacy Notice on our website (www.efgroup.co.za) explains how we collect, use, and protect personal information as required by the Protection of Personal Information Act, No. 4 of 2013 (POPIA). By using our digital platforms, you consent to our use of personal data as outlined in our Privacy Notice. The Vantage Group does not consent to its employees sending unsolicited emails. If a contravention of any privacy law by any member of the Vantage Group is alleged, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">SECURITY AND CYBER RISKS</h2>
              <p>
                By using our digital platforms, you agree to keep your login credentials (username and password) confidential and not share them with anyone. If you enable fingerprint authentication to access the digital platform on your mobile device, you agree to take appropriate measures to ensure the security of your device and prevent unauthorised access.
              </p>
              <p>
                You are fully responsible for any activities or transactions conducted under your login credentials, even if you have shared your username and password. Any use of your login credentials will be treated as if you, the account holder, initiated such activities.
              </p>
              <p>
                When selecting a username and/or password, the Vantage Group may impose specific requirements that must be met. These requirements may change periodically, and you may be required to update your credentials accordingly.
              </p>
              <p>
                The Vantage Group reserves the right to refuse to provide products and/or services if we are unable to verify the information you provide.
              </p>
              <p>
                While we prioritise the security of our digital platforms and take reasonable measures to protect user information, you acknowledge and accept the inherent risks of online interactions, including the potential for unauthorised access, data breaches, and cyberattacks. Despite our efforts to secure our digital platforms, we cannot guarantee absolute protection from security threats. It is your responsibility to ensure that any device used to access our digital platforms has up-to-date security software and that you exercise caution in managing your personal login information. We are not liable for any loss or damage arising from your access to or use of our digital platforms, including any interception, corruption, or unauthorised access to information.
              </p>
              <p>
                Please note that the Vantage Group will never request sensitive information (such as bank account details) via email. We recommend confirming any unexpected requests by contacting us through verified channels. We also advise that you regularly monitor your accounts and report any suspicious activity immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">DISCLAIMER AND LIMITATION OF LIABILITY</h2>
              <p>
                The Vantage Group accepts no liability whatsoever from you placing any reliance upon any information and/or data obtained from our digital platforms for any purpose. Use of our digital platforms is entirely at your own risk, and you hereby assume full responsibility for using them and any resultant actual or potential consequences, losses and or damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">COPYRIGHT</h2>
              <p>
                You acknowledge that the Vantage Group retains all copyright and intellectual property rights to content on any of our digital platforms. All information, trademarks, logos, and designs are protected by intellectual property laws, and accessing this website does not grant you any rights to this content. Unauthorised copying, reproduction, distribution, or other use of this material constitutes infringement. You may view or print pages only for personal, non-commercial use, provided all copyright notices remain intact. If you believe any content infringes your intellectual property rights, please contact us with details, and we will address the issue.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">LINKS TO THIRD-PARTY SITES</h2>
              <p>
                Our digital platforms may contain links to third-party websites. These are provided for convenience only, and we do not endorse or take responsibility for any content or services provided on third-party sites. You access them at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">PROHIBITION ON DEFAMATORY STATEMENTS</h2>
              <p>
                All content on all our digital platforms is expressly required to not make any defamatory statements. Any such comment is contrary to the Vantage Group's policy and outside the scope of the employment of the individual concerned. The Vantage Group will not accept any liability in respect of such comments. The employee responsible will be personally liable for any damages or other liabilities arising.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">COMPLAINTS AND DISPUTES</h2>
              <p>
                If you have a complaint, please contact us at hello@vantage.co.za. We will handle complaints in accordance with our Complaints Policy and complaints-handling procedures.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfUse;