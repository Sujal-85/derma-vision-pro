import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Camera, BarChart3, User, LogOut, Sparkles, Home, Newspaper, Brain, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const navItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "AI Assistant", href: "/ai-assistant", icon: Brain },
    { name: "Analyze", href: "/analyze", icon: Camera },
    { name: "Routine", href: "/routine", icon: Sparkles },
    { name: "News", href: "/news", icon: Newspaper },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Appointments", href: "/appointments", icon: Calendar },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">DA</span>
            </div>
            <span className="font-bold text-xl text-foreground">DermaTech AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{user.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-primary hover:shadow-professional"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                </>
              )
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-6 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 text-lg text-muted-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <div className="pt-6 border-t border-border space-y-4">
                  {!loading && (
                    user ? (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Signed in as {user.email?.split('@')[0]}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/profile')}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={signOut}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            navigate('/auth');
                            setIsOpen(false);
                          }}
                        >
                          Sign In
                        </Button>
                        <Button 
                          className="w-full bg-gradient-primary"
                          onClick={() => {
                            navigate('/auth');
                            setIsOpen(false);
                          }}
                        >
                          Get Started
                        </Button>
                      </>
                    )
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;