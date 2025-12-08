import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(100, { message: "First name must be less than 100 characters" }),
  surname: z
    .string()
    .trim()
    .min(1, { message: "Surname is required" })
    .max(100, { message: "Surname must be less than 100 characters" }),
  businessName: z
    .string()
    .trim()
    .max(200, { message: "Business name must be less than 200 characters" })
    .optional(),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(72, { message: "Password must be less than 72 characters" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

type SignupFormErrors = {
  firstName?: string;
  surname?: string;
  businessName?: string;
  email?: string;
  password?: string;
};

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SignupFormErrors>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = (): boolean => {
    const result = signupSchema.safeParse({ 
      firstName, 
      surname, 
      businessName: businessName || undefined,
      email, 
      password 
    });
    
    if (!result.success) {
      const fieldErrors: SignupFormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof SignupFormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (authError) {
        if (authError.message.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: authError.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            first_name: firstName.trim(),
            surname: surname.trim(),
            business_name: businessName.trim() || null,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
        
        // Redirect to confirmation page
        navigate("/signup-confirmation");
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof SignupFormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

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
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>
              Sign up to get started with Vantage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearError("firstName");
                    }}
                    className={errors.firstName ? "border-destructive" : ""}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Smith"
                    value={surname}
                    onChange={(e) => {
                      setSurname(e.target.value);
                      clearError("surname");
                    }}
                    className={errors.surname ? "border-destructive" : ""}
                    aria-invalid={!!errors.surname}
                    aria-describedby={errors.surname ? "surname-error" : undefined}
                  />
                  {errors.surname && (
                    <p id="surname-error" className="text-sm text-destructive">{errors.surname}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Financial advice business name <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="ABC Financial Advisors"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    clearError("businessName");
                  }}
                  className={errors.businessName ? "border-destructive" : ""}
                  aria-invalid={!!errors.businessName}
                  aria-describedby={errors.businessName ? "businessName-error" : undefined}
                />
                {errors.businessName && (
                  <p id="businessName-error" className="text-sm text-destructive">{errors.businessName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  className={errors.email ? "border-destructive" : ""}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  className={errors.password ? "border-destructive" : ""}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Min 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/auth" className="underline hover:text-foreground">
                  Sign in
                </a>
              </p>
            </form>
            
            <p className="text-center text-sm text-muted-foreground pt-4">
              By continuing, you agree to our{" "}
              <a href="/terms-of-use" className="underline hover:text-foreground">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="/privacy-notice" className="underline hover:text-foreground">
                Privacy Notice
              </a>
            </p>
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

export default Signup;