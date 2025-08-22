import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, Layers, BarChart3, Users, PiggyBank, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Testimonials from "@/components/Testimonials";
const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  
  const updateRect = useCallback(() => {
    if (heroRef.current) {
      rectRef.current = heroRef.current.getBoundingClientRect();
    }
  }, []);

  useEffect(() => {
    updateRect();
    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateRect]);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    const el = heroRef.current;
    const rect = rectRef.current;
    if (!el || !rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
    el.style.setProperty("--spotlight-opacity", "0.45");
  };
  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty("--spotlight-opacity", "0");
  };
  return <div className="min-h-screen">
      <header className="bg-background/80 backdrop-blur border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Vantage home">
            <img src="/lovable-uploads/7dc6d80a-2f1f-4523-af0c-88abbde31835.png" alt="Vantage logo" className="h-6 md:h-7 w-auto" loading="eager" />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#benefits" className="text-muted-foreground hover:text-foreground">Benefits</a>
            <a href="#cases" className="text-muted-foreground hover:text-foreground">Case Studies</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="hero" size="sm">
              <a href="#contact" aria-label="Book a demo">Book a demo</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section ref={heroRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative bg-hero text-primary-foreground">
          <div className="hero-map" aria-hidden />
          
          <div className="container py-24 md:py-32 relative">
            <p className="uppercase tracking-widest font-semibold opacity-90">Redefining Wealth</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mt-4">Investment Platform for Financial Advisers</h1>
            <p className="mt-6 max-w-2xl text-lg opacity-90">
              Vantage unifies CRM, planning tools and an investment platform into one integrated ecosystem — reducing the number of systems in your practice.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="hero" size="xl" className="bg-black text-white hover:bg-black/90 bg-none hover:bg-none">
                Book a demo <ArrowRight className="ml-1" />
              </Button>
              <Button asChild variant="premium" size="xl">
                <a href="#features">Explore features</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-background">
          <div className="container">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Integrated ecosystem</h2>
              <p className="mt-3 text-muted-foreground">
                Everything advisers need to manage clients and portfolios — in one place.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--brand-blue))]/10 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-[hsl(var(--brand-blue))]" />
                    </div>
                    CRM + Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>One client record across onboarding, suitability and reviews.</p>
                  <p>Powerful workflows, tasks and document management.</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--brand-blue))]/10 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-[hsl(var(--brand-blue))]" />
                    </div>
                    360° Client View
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>Real-time valuations, performance and fees across accounts.</p>
                  <p>Data-led insights to drive better outcomes.</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--brand-blue))]/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[hsl(var(--brand-blue))]" />
                    </div>
                    White‑labelled
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>Deliver a branded digital experience to your clients.</p>
                  <p>Scale with configurable permissions and roles.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20 bg-muted/40">
          <div className="container">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Benefits</h2>
              <p className="mt-3 text-muted-foreground">
                How Vantage helps adviser firms grow and save.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[hsl(var(--brand-orange))]/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[hsl(var(--brand-orange))]" /></div> Grow & Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-orange))]" /> Leads & conversion</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-orange))]" /> Cross‑selling</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-orange))]" /> House view funds</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-orange))]" /> Advice fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[hsl(var(--brand-blue))]/10 flex items-center justify-center"><PiggyBank className="w-4 h-4 text-[hsl(var(--brand-blue))]" /></div> Save & Optimise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-blue))]" /> Technology costs</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-blue))]" /> Manual activities</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-blue))]" /> Platform fees</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-blue))]" /> Product fees</p>
              </CardContent>
            </Card>
            </div>
          </div>
        </section>

        <section id="cases" className="py-20 bg-background">
          <div className="container">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Proven outcomes</h2>
              <p className="mt-3 text-muted-foreground">
                Real results we see with adviser firms using Vantage.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Case study — R1–2bn adviser</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2">
                  <p>R25–100k annual saving on technology</p>
                  <p>R100–150k annual saving on platform data</p>
                  <p>R400–600k annual saving on client platform fees</p>
                  <p>40% AUA growth with same support staff</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Case study — R10bn+ adviser network</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2">
                  <p>R1 – 5m annual saving on technology</p>
                  <p>R1 – 3m annual saving on platform data</p>
                  <p>R10 – 30m annual saving on client platform fees</p>
                  <p>40% AUA growth with same support staff</p>
                  <p>5–10bps margin on own model portfolios</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Testimonials />

        <section id="contact" className="pb-20 bg-muted/40">
          <div className="container text-center">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Ready to reduce your tech stack?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Let’s show you how Vantage consolidates CRM, planning and investment tools into a single, modern platform.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button asChild variant="hero" size="xl">
                <a href="mailto:hello@vantage.co.za?subject=Book%20a%20Vantage%20demo">Book a demo</a>
              </Button>
              <Button asChild variant="outline" size="xl">
                <a href="mailto:hello@vantage.co.za">Contact sales</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10 bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vantage. All rights reserved.</p>
          <nav className="flex gap-6">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#benefits" className="hover:text-foreground">Benefits</a>
            <a href="#cases" className="hover:text-foreground">Case studies</a>
          </nav>
        </div>
      </footer>
    </div>;
};
export default Index;