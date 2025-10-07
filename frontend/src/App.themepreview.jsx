import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, FileText, Shield, Users, Zap, Scale, Star, CheckCircle, ArrowRight, Play } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

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
}

export default function ThemePreview() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.15),transparent_60%)]"></div>

        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-primary/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-accent/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-primary/5 rounded-full blur-2xl animate-pulse-soft"></div>

        <motion.div 
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="max-w-6xl mx-auto text-center">
            {/* Enhanced Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full glass-card border-2 border-border/50 shadow-xl mb-10"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Star className="w-5 h-5 text-accent fill-accent" />
              <span className="text-sm font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Trusted by 10,000+ Legal Professionals</span>
            </motion.div>

            {/* Enhanced Main Heading */}
            <motion.h1 
              className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-balance text-foreground mb-10 leading-tight"
              variants={itemVariants}
            >
              Where <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">Justice</span> Meets
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-gradient">Technology</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl text-muted-foreground text-pretty mb-12 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Revolutionary legal tech platform powered by AI-driven courtroom simulations, intelligent case management,
              and advanced evidence analysis. Transform your practice with cutting-edge technology.
            </motion.p>

            {/* Enhanced CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
              variants={itemVariants}
            >
              <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="group bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground px-12 py-6 text-lg font-bold shadow-2xl">
                  Start Free Trial
                  <motion.div
                    className="inline-block ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 border-primary/30 glass-card text-foreground px-12 py-6 text-lg font-bold shadow-2xl"
                >
                  <Play className="mr-2 h-6 w-6" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Enhanced Trust Indicators */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              variants={itemVariants}
            >
              <motion.div 
                className="flex items-center gap-2.5 glass-card px-5 py-3 rounded-full border-2 border-border/50 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle className="w-5 h-5 text-success fill-success/20" />
                <span className="font-semibold">Bank-level Security</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2.5 glass-card px-5 py-3 rounded-full border-2 border-border/50 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle className="w-5 h-5 text-success fill-success/20" />
                <span className="font-semibold">GDPR Compliant</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2.5 glass-card px-5 py-3 rounded-full border-2 border-border/50 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle className="w-5 h-5 text-success fill-success/20" />
                <span className="font-semibold">24/7 Support</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section - Enhanced Modern Layout */}
      <section id="features" className="py-24 lg:py-36 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full glass-card text-accent mb-10 border-2 border-accent/30 shadow-xl hover:scale-105 transition-transform duration-300">
              <Zap className="w-5 h-5 fill-accent/20" />
              <span className="text-sm font-bold">Powerful Features</span>
            </div>
            <h2 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-8">
              Revolutionary Legal Technology
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your legal practice with cutting-edge AI and intuitive case management tools designed for modern law firms.
            </p>
          </div>

          {/* Enhanced Feature Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="border-2 border-border/50 glass-card h-full">
              <CardHeader>
                <Brain className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-card-foreground">AI Courtroom Agents</CardTitle>
                <CardDescription>
                  Intelligent AI agents simulate realistic courtroom scenarios for comprehensive case preparation.
                </CardDescription>
              </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="border-2 border-border/50 glass-card h-full">
              <CardHeader>
                <FileText className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-card-foreground">Smart Case Management</CardTitle>
                <CardDescription>
                  Organize, track, and manage your legal cases with intelligent automation and insights.
                </CardDescription>
              </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="border-2 border-border/50 glass-card h-full">
              <CardHeader>
                <Shield className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-card-foreground">Evidence Analysis</CardTitle>
                <CardDescription>
                  Advanced AI-powered evidence upload, analysis, and categorization for stronger cases.
                </CardDescription>
              </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="border-2 border-border/50 glass-card h-full">
              <CardHeader>
                <Users className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-card-foreground">Collaborative Workspace</CardTitle>
                <CardDescription>
                  Seamlessly collaborate with your legal team in real-time with secure document sharing.
                </CardDescription>
              </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="border-2 border-border/50 glass-card h-full">
              <CardHeader>
                <Zap className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-card-foreground">Instant Simulations</CardTitle>
                <CardDescription>
                  Run comprehensive legal simulations instantly to test strategies and outcomes.
                </CardDescription>
              </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="border-2 border-border/50 glass-card h-full">
              <CardHeader>
                <Scale className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-card-foreground">Compliance Ready</CardTitle>
                <CardDescription>
                  Built-in compliance tools ensure your practice meets all legal and regulatory requirements.
                </CardDescription>
              </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Color Palette Showcase */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-extrabold text-4xl text-center mb-16">New Color Theme</h2>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <motion.div 
                className="h-32 bg-primary rounded-xl shadow-lg flex items-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-primary-foreground font-bold">Primary</span>
              </motion.div>
              <motion.div 
                className="h-32 bg-accent rounded-xl shadow-lg flex items-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-accent-foreground font-bold">Accent</span>
              </motion.div>
            </div>
            <div className="space-y-4">
              <motion.div 
                className="h-32 bg-success rounded-xl shadow-lg flex items-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-white font-bold">Success</span>
              </motion.div>
              <motion.div 
                className="h-32 bg-warning rounded-xl shadow-lg flex items-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-white font-bold">Warning</span>
              </motion.div>
            </div>
            <div className="space-y-4">
              <motion.div 
                className="h-32 bg-info rounded-xl shadow-lg flex items-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-white font-bold">Info</span>
              </motion.div>
              <motion.div 
                className="h-32 bg-destructive rounded-xl shadow-lg flex items-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-destructive-foreground font-bold">Destructive</span>
              </motion.div>
            </div>
            <div className="space-y-4">
              <motion.div 
                className="h-32 bg-card border-2 border-border rounded-xl shadow-lg flex items-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-card-foreground font-bold">Card</span>
              </motion.div>
              <motion.div 
                className="h-32 bg-muted rounded-xl shadow-lg flex items-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-muted-foreground font-bold">Muted</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}