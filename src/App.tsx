import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { RegionProvider } from "@/contexts/RegionContext";
import { PageContextProvider } from "@/contexts/PageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsOfUse from "./pages/TermsOfUse";
import EmailView from "./pages/EmailView";
import PrivacyNotice from "./pages/PrivacyNotice";
import PaiaManual from "./pages/PaiaManual";
import Disclaimer from "./pages/Disclaimer";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import SignupConfirmation from "./pages/SignupConfirmation";
import Dashboard from "./pages/Dashboard";
import CommandCenter from "./pages/CommandCenter";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Email from "./pages/Email";
import Calendar from "./pages/Calendar";
import Insights from "./pages/Insights";
import Tasks from "./pages/Tasks";
import Practice from "./pages/Practice";
import AIAssistant from "./pages/AIAssistant";
import Portfolio from "./pages/Portfolio";
import ComposeEmail from "./pages/ComposeEmail";
import Administration from "./pages/Administration";
import AccountSettings from "./pages/AccountSettings";

const queryClient = new QueryClient();

const App = () => (
  <RegionProvider>
    <PageContextProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/command-center" element={<CommandCenter />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:clientId" element={<ClientDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/email" element={<Email />} />
              <Route path="/email/view/:id" element={<EmailView />} />
              <Route path="/email/compose" element={<ComposeEmail />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/administration" element={<Administration />} />
              <Route path="/administration/:section" element={<Administration />} />
              <Route path="/administration/:section/:tab" element={<Administration />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/signup-confirmation" element={<SignupConfirmation />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/privacy-notice" element={<PrivacyNotice />} />
              <Route path="/paia-manual" element={<PaiaManual />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </PageContextProvider>
  </RegionProvider>
);

export default App;
