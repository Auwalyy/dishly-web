import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  "For Restaurants": [
    { label: "Partner With Us", href: "/vendor/register" },
    { label: "Restaurant Dashboard", href: "/vendor/dashboard" },
    { label: "Pricing", href: "/pricing" },
    { label: "Success Stories", href: "/stories" },
  ],
  "For Delivery": [
    { label: "Become a Partner", href: "/delivery/register" },
    { label: "Rider Portal", href: "/rider/dashboard" },
    { label: "Fleet Management", href: "/delivery/dashboard" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold text-white">Dishly</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Your favourite food, delivered fast. Connecting thousands of restaurants with millions of hungry customers.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-orange-500" /><span>hello@dishly.com</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-orange-500" /><span>+234 800 DISHLY</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-500" /><span>Lagos, Nigeria</span></div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Icon className="h-4 w-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm hover:text-orange-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Dishly. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-orange-400 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-orange-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
