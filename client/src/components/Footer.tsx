import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ATELIER ISSEI</h3>
            <p className="text-sm text-gray-600">
              見る人の心を豊かにする、<br />
              幸せを呼ぶアート
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">CONTACT</h4>
            <address className="text-sm text-gray-600 not-italic">
              〒000-0000<br />
              Tokyo, Japan<br />
              contact@atelier-issei.com
            </address>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">FOLLOW US</h4>
            <div className="flex space-x-6">
              <a 
                href="https://www.facebook.com/profile.php?id=100025683092990"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/iisssseeiiii/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/isseing333"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} ATELIER ISSEI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
