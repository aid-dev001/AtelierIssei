import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "TOP" },
    { href: "/artworks", label: "ARTWORKS" },
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
          <Link href="/">
            <a className="text-2xl font-bold tracking-wider">ATELIER ISSEI</a>
          </Link>
          <div className="hidden md:flex space-x-8">
            {links.map(({ href, label }) => (
              <Link key={href} href={href}>
                <a className={cn(
                  "text-sm tracking-widest hover:text-primary/80 transition-colors",
                  "py-2 px-1 border-b-2 border-transparent hover:border-primary/80"
                )}>
                  {label}
                </a>
              </Link>
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
              <Link key={href} href={href}>
                <a
                  className="block text-lg tracking-wider py-2 border-b border-gray-100 hover:text-primary/80 transition-colors"
                  onClick={closeMenu}
                >
                  {label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
