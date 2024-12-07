import { Link } from "wouter";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const links = [
    { href: "/", label: "TOP" },
    { href: "/artworks", label: "ARTWORKS" },
    { href: "/profile", label: "PROFILE" },
    { href: "/news", label: "NEWS" },
    { href: "/contact", label: "CONTACT" },
  ];

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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
