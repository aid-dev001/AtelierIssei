import { Separator } from "@/components/ui/separator";

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
            <div className="flex space-x-4">
              {/* Social media links */}
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
