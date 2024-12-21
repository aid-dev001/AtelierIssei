import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/Home";
import Artworks from "./pages/Artworks";
import ArtworkDetail from "./pages/ArtworkDetail";
import Profile from "./pages/Profile";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Ateliers from "./pages/Ateliers";
import Testimonials from "./pages/Testimonials";
import Concept from "./pages/Concept";
import Exhibition from "./pages/Exhibition";
import ExhibitionDetail from "./pages/ExhibitionDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/ThemeProvider";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/artworks" component={Artworks} />
          <Route path="/artwork/:id" component={ArtworkDetail} />
          <Route path="/profile" component={Profile} />
          <Route path="/news" component={News} />
          <Route path="/voices" component={Testimonials} />
          <Route path="/contact" component={Contact} />
          <Route path="/ateliers" component={Ateliers} />
          <Route path="/concept" component={Concept} />
          <Route path="/exhibition" component={Exhibition} />
          <Route path="/exhibition/:id" component={ExhibitionDetail} />
          <Route path="/collections" component={Collections} />
          <Route path="/collections/:id" component={CollectionDetail} />
          <Route path="/admin/:adminPath" component={AdminLogin} />
          <Route path="/admin/:adminPath/dashboard" component={AdminDashboard} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
