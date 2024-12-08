import { useState } from "react";
import ScrollToTopLink from "./ScrollToTopLink";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "TOP" },
    { href: "/artworks", label: "ARTWORKS" },
    { href: "/concept", label: "CONCEPT" },
    { href: "/ateliers", label: "ATELIER" },
    { href: "/profile", label: "PROFILE" },
    { href: "/news", label: "NEWS" },
    { href: "/voices", label: "VOICES" },
    { href: "/contact", label: "CONTACT" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <ScrollToTopLink href="/" className="text-2xl font-bold tracking-wider">
            ATELIER ISSEI
          </ScrollToTopLink>
          <div className="hidden md:flex space-x-8">
            {links.map(({ href, label }) => (
              <ScrollToTopLink 
                key={href} 
                href={href}
                className={cn(
                  "text-sm tracking-widest relative py-2 px-1",
                  "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5",
                  "after:bg-primary/80 after:transform after:scale-x-0 after:origin-bottom-right",
                  "hover:text-primary/80 hover:after:scale-x-100 hover:after:origin-bottom-left",
                  "transition-all duration-300 after:transition-transform after:duration-300",
                  "hover:scale-105"
                )}
              >
                {label}
              </ScrollToTopLink>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMenu}
      />
      
      {/* Mobile menu panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-64 bg-white/95 backdrop-blur-sm z-50 transform transition-transform duration-300 ease-out shadow-xl md:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="pt-20 px-6">
          <div className="space-y-6">
            {links.map(({ href, label }) => (
              <ScrollToTopLink
                key={href}
                href={href}
                className="block text-lg tracking-wider py-2 border-b border-gray-100 hover:text-primary/80 transition-colors"
                onClick={closeMenu}
              >
                {label}
              </ScrollToTopLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
