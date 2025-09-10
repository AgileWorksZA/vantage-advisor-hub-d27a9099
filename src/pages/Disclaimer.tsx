import { Button } from "@/components/ui/button";

const Disclaimer = () => {
  const openCalendly = () => {
    const width = Math.floor(window.screen.width * 0.7);
    const height = Math.floor(window.screen.height * 0.7);
    const left = Math.floor((window.screen.width - width) / 2);
    const top = Math.floor((window.screen.height - height) / 2);
    
    window.open(
      'https://calendly.com/hello-vantage/30min',
      'calendly',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  return (
    <div className="min-h-screen">
      <header className="bg-background/80 backdrop-blur border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Vantage home">
            <img src="/lovable-uploads/7dc6d80a-2f1f-4523-af0c-88abbde31835.png" alt="Vantage logo" className="h-6 md:h-7 w-auto" loading="eager" />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="/#benefits" className="text-muted-foreground hover:text-foreground">Benefits</a>
            <a href="/#cases" className="text-muted-foreground hover:text-foreground">Case Studies</a>
          </nav>
          <Button onClick={openCalendly} variant="default" className="text-sm">
            Book a demo
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-lg">
              Disclaimer for Vantage Technologies (Pty) Ltd ("EFG") and subsidiaries (collectively referred to as the "Group".)
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Subsidiaries:</h2>
              <ul className="list-disc pl-6 mb-6">
                <li>Vantage Invest (Pty) Ltd</li>
                <li>Vantage Nominees (RF) (Pty) Ltd</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Confidentiality</h2>
              <p className="mb-6">
                This email and any attachment hereto are confidential and may contain privileged or copyright information. You may not present this message to another party without consent from the sender. If you are not the intended recipient, please notify the sender and delete this email immediately. Please note that disclosing, copying, distributing, or taking any action based on the contents of this information are strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Protection of Personal Information</h2>
              <p className="mb-6">
                The Group takes all reasonable measures to protect the personal information of our clients, service providers and other relevant stakeholders. For further information about how we process personal information, please review the privacy policy of the relevant entity of the Group made available on the applicable websites. The Group does not consent to its employees sending unsolicited emails. If a contravention of any privacy law by any Group member is alleged, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cyber Risk Warning</h2>
              <ul className="list-disc pl-6 mb-6">
                <li>Sending bank account details via email is inherently risky and is avoided in our business.</li>
                <li>Please note that our bank account details will never change, and we will not notify you of any changes via email.</li>
                <li>Always independently confirm the bank account details with us via a telephone call to a trusted and verified phone number.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Liability</h2>
              <p className="mb-4">
                This email does not constitute a binding agreement between the Group and any person, unless explicitly stated, consequent to the applicable authority being granted in terms of the Group's policies. The Group does not accept any liability or responsibility for:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>any interception, corruption, destruction, loss, delayed arrival,</li>
                <li>incompleteness or tampering with information contained in this email incorrect delivery</li>
                <li>any effect on any electronic device of the recipient.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Viruses</h2>
              <p className="mb-6">
                The Group does not certify or guarantee that this email is free from viruses or defects.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Advice</h2>
              <p className="mb-6">
                Any views or opinions presented in this email are solely those of the sender and do not necessarily represent those of the Group. Any actions taken based on this email are at the reader's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Other</h2>
              <p className="mb-6">
                The sender of this email is expressly required not to make any defamatory statements. Any such communication is contrary to the Group's policy and outside the scope of the employment of the individual concerned. The Group will not accept any liability in respect of such communication. The employee responsible will be personally liable for any damages or other liabilities arising.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-10 bg-foreground">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-background">
          <p>© {new Date().getFullYear()} Vantage. All rights reserved.</p>
          <nav className="flex gap-6">
            <a href="/terms-of-use" className="hover:text-background/80">Terms of use</a>
            <a href="/privacy-notice" className="hover:text-background/80">Privacy Notice</a>
            <a href="/paia-manual" className="hover:text-background/80">PAIA Manual</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Disclaimer;