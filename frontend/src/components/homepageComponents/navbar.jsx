import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Logo from "@/assets/T_Logo.png"
import LightLogo from "@/assets/L_logo.png"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    LogOut,
    Plus,
    User,
    MessageCircle,
    Menu,
    X,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Link, useNavigate } from "react-router-dom"

export default function Navbar() {
    const { isLoggedIn, user, logout, loading } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = async () => {
        await logout()
        navigate("/home")
        setMobileMenuOpen(false)
    }

    const handleChatbot = () => {
        navigate("/chatbot")
        setMobileMenuOpen(false)
    }

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

    if (!mounted || loading) return null

    return (
        <nav className="sticky top-0 z-50 glass-card border-b-2 border-border/30 shadow-2xl backdrop-blur-xl">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link
                        to={isLoggedIn ? "/dashboard" : "/home"}
                        className="flex items-center space-x-3 group flex-shrink-0"
                    >
                        <div className="w-12 h-12 rounded-full border-2 border-primary/50 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center bg-gradient-to-br from-background to-muted/30 group-hover:border-primary">
                            <img
                                src={document.documentElement.classList.contains("dark") ? LightLogo : Logo}
                                alt="JURIX Logo"
                                className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                            JURIX
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {!isLoggedIn ? (
                            <>
                                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium relative group">
                                    Features
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </a>
                                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors font-medium relative group">
                                    About
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </a>
                                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium relative group">
                                    Contact
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                                </a>
                                <ThemeToggle />
                                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                                    Login
                                </Link>
                                <Link to="/signup">
                                    <Button className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/95 hover:to-primary/95 text-primary-foreground font-bold px-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/95 hover:to-primary/95 shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift text-primary-foreground font-bold px-8"
                                >
                                    <Link to="/case" className="flex items-center space-x-2">
                                        <Plus className="h-4 w-4" />
                                        <span>Enter Case</span>
                                    </Link>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleChatbot}
                                    className="w-11 h-11 rounded-xl glass-card border-2 border-border/50 hover:border-accent hover:bg-accent/10 transition-all duration-300 hover:scale-110"
                                >
                                    <MessageCircle className="h-5 w-5 text-accent" />
                                </Button>

                                <ThemeToggle />

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="relative h-11 w-11 rounded-xl glass-card border-2 border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={user?.avatar}
                                                    alt={user?.name || 'User'}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
                                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64 glass-card border-border/50 shadow-xl" align="end">
                                        <div className="p-3 border-b border-border/50">
                                            <p className="font-semibold text-foreground">{user?.name || 'User'}</p>
                                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                                        </div>
                                        <DropdownMenuItem asChild className="p-3">
                                            <Link to="/profile" className="flex items-center">
                                                <User className="mr-3 h-4 w-4" />
                                                <span>Profile Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="opacity-50" />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="p-3 text-destructive focus:text-destructive hover:bg-destructive/10 cursor-pointer"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span>Sign Out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMobileMenu}
                            className="w-10 h-10 rounded-xl glass-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border/20 glass-card animate-slide-up">
                        <div className="px-4 py-6 space-y-6">
                            {!isLoggedIn ? (
                                <>
                                    <div className="space-y-3">
                                        <a
                                            href="#features"
                                            className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Features
                                        </a>
                                        <a
                                            href="#about"
                                            className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            About
                                        </a>
                                        <a
                                            href="#contact"
                                            className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Contact
                                        </a>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <ThemeToggle className="w-full justify-start" />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Link
                                            to="/login"
                                            className="block w-full"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Button variant="outline" className="w-full">
                                                Login
                                            </Button>
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="block w-full"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <Link
                                            to="/case"
                                            className="block w-full"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Enter Case
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={handleChatbot}
                                        >
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            Chatbot
                                        </Button>

                                        <Link
                                            to="/profile"
                                            className="block w-full"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Button variant="outline" className="w-full justify-start">
                                                <User className="h-4 w-4 mr-2" />
                                                Profile
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={user?.avatar}
                                                    alt={user?.name || 'User'}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>

                                        <ThemeToggle />
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Log out
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}