import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Brain, FileText, Users, Shield, Zap, ArrowRight, Play, Star, CheckCircle, Github, Linkedin, Mail } from "lucide-react"
import { motion } from "framer-motion"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

export default function HomePage() {
    const [_isDemoOpen, _setIsDemoOpen] = useState(false)
    const features = [
        { icon: Brain, title: "AI Courtroom Agents", desc: "Intelligent AI agents simulate realistic courtroom scenarios for comprehensive case preparation." },
        { icon: FileText, title: "Smart Case Management", desc: "Organize, track, and manage your legal cases with intelligent automation and insights." },
        { icon: Shield, title: "Evidence Analysis", desc: "AI-powered evidence upload, analysis, and categorization for stronger cases." },
        { icon: Users, title: "Collaborative Workspace", desc: "Seamlessly collaborate with your legal team in real-time with secure document sharing." },
        { icon: Zap, title: "Instant Simulations", desc: "Run comprehensive legal simulations instantly to test strategies and outcomes." },
        // { icon: Scale, title: "Compliance Ready", desc: "Built-in compliance tools ensure your practice meets all legal and regulatory requirements." },
    ];

    return (
        <div className="min-h-screen bg-background overflow-hidden">

            {/* Hero Section - Enhanced Design */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Enhanced Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.15),transparent_60%)] dark:bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.08),transparent_60%)]"></div>

                {/* Enhanced Floating Elements */}
                <div className="absolute top-20 left-10 w-24 h-24 bg-primary/8 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-32 right-16 w-40 h-40 bg-accent/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-primary/5 rounded-full blur-2xl animate-pulse-soft"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-6xl mx-auto text-center">
                        {/* Enhanced Badge */}
                        <div className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full glass-card border-2 border-border/50 shadow-xl mb-10 animate-fade-in hover:scale-105 transition-transform duration-300">
                            <Star className="w-5 h-5 text-accent fill-accent" />
                            <span className="text-sm font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Trusted by 10,000+ Legal Professionals</span>
                        </div>

                        {/* Enhanced Main Heading */}
                        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-balance text-foreground mb-10 animate-slide-up leading-tight">
                            Where <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">Justice</span> Meets
                            <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-gradient">Technology</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground text-pretty mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            Revolutionary legal tech platform powered by AI-driven courtroom simulations, intelligent case management,
                            and advanced evidence analysis. Transform your practice with cutting-edge technology.
                        </p>

                        {/* Enhanced CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up mb-20" style={{ animationDelay: '0.4s' }}>
                            <Button size="lg" className="group bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/95 hover:to-primary/95 text-primary-foreground px-12 py-6 text-lg font-bold shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="group border-2 border-primary/30 glass-card text-foreground hover:bg-primary/10 hover:border-primary/60 px-12 py-6 text-lg font-bold shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                                onClick={() => _setIsDemoOpen(true)}
                            >
                                <Play className="mr-2 h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
                                Watch Demo
                            </Button>
                        </div>

                        {/* Enhanced Trust Indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-center gap-2.5 glass-card px-5 py-3 rounded-full border-2 border-border/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <CheckCircle className="w-5 h-5 text-success fill-success/20" />
                                <span className="font-semibold">Bank-level Security</span>
                            </div>
                            <div className="flex items-center gap-2.5 glass-card px-5 py-3 rounded-full border-2 border-border/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <CheckCircle className="w-5 h-5 text-success fill-success/20" />
                                <span className="font-semibold">GDPR Compliant</span>
                            </div>
                            <div className="flex items-center gap-2.5 glass-card px-5 py-3 rounded-full border-2 border-border/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <CheckCircle className="w-5 h-5 text-success fill-success/20" />
                                <span className="font-semibold">24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
            <section id="features" className="py-24 lg:py-36 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 relative z-10">
                        <motion.div
                            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-primary/10 text-primary mb-10 border-2 border-primary/20 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Zap className="w-5 h-5" />
                            <span className="text-sm font-bold">Powerful Features</span>
                        </motion.div>
                        <motion.h2
                            className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Revolutionary Legal Technology
                        </motion.h2>
                        <motion.p
                            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Transform your legal practice with cutting-edge AI and intuitive case management tools designed for modern law firms.
                        </motion.p>
                    </div>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 auto-rows-fr"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className={`
        ${i === 2 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}
        ${i === 4 ? "sm:col-span-2 lg:col-span-2" : ""}
      `}
                            >
                                <div className={`group p-8 rounded-2xl h-full border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col justify-between ${i === 2 ? "card-glow shadow-xl" : ""}`}>
                                    <div className="flex items-center gap-4">
                                        <feature.icon className="h-8 w-8 text-primary transition-colors duration-300 shrink-0" />
                                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <div className="my-4 border-t border-border/50 group-hover:border-primary/30 transition-colors duration-300"></div>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </section>

            {/* Testimonials Section - Modern Carousel */}
            <section className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
                <div className="absolute inset-0 gradient-mesh opacity-30"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-medium">Client Success</span>
                        </div>
                        <h2 className="font-heading font-bold text-fluid-2xl lg:text-5xl text-foreground mb-6">
                            Trusted by Legal Professionals
                        </h2>
                        <p className="text-fluid-lg text-muted-foreground max-w-3xl mx-auto">
                            Join thousands of attorneys who have transformed their practice with Jurix
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="glass-card border-0 hover-lift">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                    ))}
                                </div>
                                <blockquote className="font-serif italic text-lg text-card-foreground mb-6 leading-relaxed">
                                    "Jurix has revolutionized how we prepare for trials. The AI simulations are incredibly realistic and
                                    have improved our success rate by 40%."
                                </blockquote>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold">SC</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-card-foreground">Sarah Chen</p>
                                        <p className="text-sm text-muted-foreground">Senior Partner, Chen & Associates</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-0 hover-lift">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                    ))}
                                </div>
                                <blockquote className="font-serif italic text-lg text-card-foreground mb-6 leading-relaxed">
                                    "The evidence analysis feature saved us countless hours. What used to take days now takes minutes with
                                    incredible accuracy."
                                </blockquote>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold">MR</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-card-foreground">Michael Rodriguez</p>
                                        <p className="text-sm text-muted-foreground">Criminal Defense Attorney</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-0 hover-lift md:col-span-2 lg:col-span-1">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                    ))}
                                </div>
                                <blockquote className="font-serif italic text-lg text-card-foreground mb-6 leading-relaxed">
                                    "Jurix's collaborative features have transformed our firm's workflow. We're more efficient and better
                                    prepared than ever."
                                </blockquote>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold">ET</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-card-foreground">Emily Thompson</p>
                                        <p className="text-sm text-muted-foreground">Managing Partner, Thompson Law</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section - Modern Design */}
            <section className="py-24 lg:py-32 relative overflow-hidden">
                {/* Background gradient (Dark Blue → Cyan) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#1e3a8a] to-[#0ea5e9]"></div>
                {/* Subtle mesh overlay for texture */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)] opacity-30"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-heading font-bold text-white text-fluid-2xl lg:text-5xl mb-8 drop-shadow-lg">
                            Empower Your Legal Practice with Jurix
                        </h2>
                        <p className="text-lg mb-12 max-w-3xl mx-auto text-white/90 leading-relaxed">
                            Experience AI-driven courtroom simulation, smart legal document parsing, and collaborative case analysis.
                            Begin your free trial and redefine your approach to justice.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="group bg-cyan-400 hover:bg-cyan-300 text-[#0a192f] px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-cyan-400/40 transition-all"
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="group border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-2xl backdrop-blur-md hover:shadow-white/30 transition-all"
                            >
                                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Schedule Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Footer */}
            <footer className="bg-background/95 backdrop-blur border-t border-border py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <Scale className="h-8 w-8 text-accent" />
                                <span className="font-heading font-bold text-2xl text-foreground">Jurix</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                                Where Justice Meets Technology. Empowering legal professionals with AI-driven solutions for the modern courtroom.
                            </p>
                            <div className="flex space-x-4">
                                <div className="flex gap-3">
                                    <a
                                        href="https://github.com/0Ankit0-0"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                                        title="GitHub"
                                    >
                                        <Github className="h-5 w-5" />
                                    </a>

                                    <a
                                        href="https://www.linkedin.com/in/ankit-vishwakarma-9540502aa/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                                        title="LinkedIn"
                                    >
                                        <Linkedin className="h-5 w-5" />
                                    </a>

                                    <a
                                        href="mailto:ankit.d.vishwakarma@gmail.com"
                                        className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                                        title="Email"
                                    >
                                        <Mail className="h-5 w-5" />
                                    </a>
                                </div>

                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Product</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Support</h3>
                            <ul className="space-y-3 text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                            &copy; 2025 Jurix. All rights reserved. Where Justice Meets Technology.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-success" />
                                SOC 2 Compliant
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-success" />
                                GDPR Ready
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}