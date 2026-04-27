import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFoundPage from "./pages/NotFoundCustom.tsx";
import { ModelsList, ModelDetail } from "./pages/Models.tsx";
import { BlogList, BlogPost } from "./pages/Blog.tsx";
import { NewsList, NewsItem } from "./pages/News.tsx";
import { Login, Signup } from "./pages/Auth.tsx";
import { ForgotPassword, ResetPassword } from "./pages/ForgotPassword.tsx";
import Chat from "./pages/Chat.tsx";
import Personal from "./pages/Personal.tsx";
import Admin from "./pages/Admin.tsx";
import PricingPage from "./pages/PricingPage.tsx";
import ContactsPage from "./pages/Contacts.tsx";
import FaqPage from "./pages/Faq.tsx";
import ReviewsPage from "./pages/Reviews.tsx";
import LegalPage from "./pages/Legal.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import CookieBanner from "./components/CookieBanner.tsx";
import AnalyticsLoader from "./components/AnalyticsLoader.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/models" element={<ModelsList />} />
          <Route path="/models/:slug" element={<ModelDetail />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:slug" element={<NewsItem />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* New pages */}
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/legal/:doc" element={<LegalPage />} />

          {/* Protected routes */}
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/personal" element={<ProtectedRoute><Personal /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Global cookie banner */}
        <CookieBanner />

        {/* Conditional analytics loader — only loads after consent */}
        <AnalyticsLoader />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
