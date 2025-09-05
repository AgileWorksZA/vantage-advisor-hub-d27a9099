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
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">
              Content will be provided by the user in the next prompt.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfUse;