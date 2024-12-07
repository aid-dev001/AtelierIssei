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
import Testimonials from "./pages/Testimonials";
import ArtworksByLocation from "./pages/ArtworksByLocation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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
          <Route path="/artworks/location/:location" component={ArtworksByLocation} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
