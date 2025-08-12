import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

const quotes = [
  "Asset to my practice",
  "Very good system",
  "Incredible asset",
  "Better than any other CRM’s used before",
  "Simplistic as well as clean",
  "We are watching this space with great excitement!",
  "Very user-friendly and easy",
  "Comprehensive range of features",
  "Saves time and reduces stress",
  "Overall experience has been positive.",
];

const Testimonials = () => {
  const [api, setApi] = useState<CarouselApi | undefined>(undefined);

  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => {
      api.scrollNext();
    }, 3000);
    return () => clearInterval(id);
  }, [api]);

  return (
    <section id="testimonials" className="py-20 bg-muted/40">
      <div className="container">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">What Advisers are saying</h2>
          <p className="mt-3 text-muted-foreground">
            Real feedback from financial advisers using Vantage.
          </p>
        </div>

        <div className="relative mt-10">
          <Carousel opts={{ loop: true }} setApi={setApi}>
            <CarouselContent>
              {quotes.map((q, idx) => (
                <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full">
                    <div className="p-6 h-full flex items-center">
                      <blockquote className="text-lg md:text-xl italic text-foreground">
                        “{q}”
                      </blockquote>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:inline-flex" aria-label="Previous testimonials" />
            <CarouselNext className="hidden md:inline-flex" aria-label="Next testimonials" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
