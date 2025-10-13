import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Facebook,
  Shield,
  Award,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerSections = [
    {
      title: "Popular",
      links: [
        { name: "Home", href: "/" },
        { name: "AI Assistant", href: "/ai-assistant" },
        { name: "Analyze", href: "/analyze" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Appointments", href: "/appointments" },
        { name: "Routine", href: "/routine" },
        { name: "News", href: "/news" },
        { name: "Settings", href: "/settings" },
        { name: "Profile", href: "/profile" },
        { name: "Sign In", href: "/auth" }
      ]
    },
    // {
    //   title: "Platform",
    //   links: [
    //     { name: "Skin Analysis", href: "#analysis" },
    //     { name: "Dashboard", href: "#dashboard" },
    //     { name: "Progress Tracking", href: "#progress" },
    //     { name: "API Documentation", href: "#api" }
    //   ]
    // },
    // {
    //   title: "Solutions",
    //   links: [
    //     { name: "For Individuals", href: "#individuals" },
    //     { name: "For Professionals", href: "#professionals" },
    //     { name: "For Clinics", href: "#clinics" },
    //     { name: "Enterprise", href: "#enterprise" }
    //   ]
    // },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "#help" },
        { name: "Clinical Studies", href: "#studies" },
        { name: "Skin Care Guide", href: "#guide" },
        { name: "Blog", href: "#blog" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#careers" },
        { name: "Press", href: "#press" },
        { name: "Contact", href: "#contact" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Facebook, href: "#", label: "Facebook" }
  ];

  const certifications = [
    { icon: Shield, text: "HIPAA Compliant" },
    { icon: Award, text: "FDA Approved" },
    { icon: Heart, text: "Dermatologist Recommended" }
  ];

  return (
    <footer className="bg-muted/20 border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">DA</span>
                </div>
                <span className="font-bold text-xl">DermaTech AI</span>
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                Professional-grade AI-powered skin analysis platform trusted by 
                dermatologists and skincare professionals worldwide.
              </p>

              {/* Contact Info */}
              {/* <div className="space-y-3">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>support@dermatech.ai</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div> */}

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="icon"
                    className="w-10 h-10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <social.icon className="w-4 h-4" />
                    <span className="sr-only">{social.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="font-semibold text-foreground">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          {link.href.startsWith('/') ? (
                            <Link 
                              to={link.href}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {link.name}
                            </Link>
                          ) : (
                            <a 
                              href={link.href}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {link.name}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © 2024 DermaTech AI. All rights reserved.
            </div>

            {/* Certifications */}
            <div className="flex items-center space-x-6">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <cert.icon className="w-4 h-4" />
                  <span>{cert.text}</span>
                </div>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;