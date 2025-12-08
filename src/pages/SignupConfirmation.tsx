import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";

const SignupConfirmation = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Vantage home">
            <img 
              src="/lovable-uploads/7dc6d80a-2f1f-4523-af0c-88abbde31835.png" 
              alt="Vantage logo" 
              className="h-6 md:h-7 w-auto" 
              loading="eager" 
            />
          </a>
          <Button asChild variant="outline" size="sm">
            <a href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
          </Button>
        </div>
      </header>

      <main className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="text-base">
              We've sent a confirmation link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Please click the link in the email to verify your account and complete your registration. 
              The link will expire in 24 hours.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Didn't receive the email?</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and check again</li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button asChild variant="outline" className="w-full">
                <a href="/auth">Go to Sign In</a>
              </Button>
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a href="mailto:support@vantage.co.za" className="underline hover:text-foreground">
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
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

export default SignupConfirmation;
