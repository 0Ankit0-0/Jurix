import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import api from "@/services/api"
import { GoogleLogin } from "@react-oauth/google"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const { login, handleGoogleLogin } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const onGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true)
    try {
      const result = await handleGoogleLogin(credentialResponse)

      if (result.success) {
        setTimeout(() => {
          navigate("/dashboard")
        }, 1500)
      }
    } catch (error) {
      console.error('Google login error:', error)

    } finally {
      setIsGoogleLoading(false)
    }
  }

  const onGoogleError = () => {
    console.error('Google login failed')
    toast.error("Google login failed. Please try again.")
    setIsGoogleLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔐 Attempting login for:', formData.email)

      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      })

      if (response.status === 200 && response.data.token) {
        const success = login(response.data.token, response.data.user)

        if (success) {
          toast.success("Login successful!")
          // Small delay to show success message
          setTimeout(() => {
            navigate("/dashboard")
          }, 1500)
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error)

      let errorMessage = 'Login failed'

      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection.'
      } else if (!error.response) {
        errorMessage = 'Network error. Please check if the server is running.'
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 gradient-aurora"></div>
      <div className="absolute inset-0 gradient-mesh opacity-50"></div>

      {/* Enhanced Floating Elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-primary/8 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-32 right-16 w-48 h-48 bg-accent/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse-soft"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Logo and Header */}
        <div className="text-center mb-14 animate-fade-in">
          <h1 className="font-heading text-fluid-2xl font-extrabold text-foreground mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-xl font-medium">Sign in to your Jurix account</p>
        </div>

        <Card className="glass-card border-2 border-border/30 shadow-2xl animate-slide-up hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500">
          <CardHeader className="space-y-3 p-10">
            <CardTitle className="font-heading text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sign In</CardTitle>
            <CardDescription className="text-center text-base font-medium">
              Enter your credentials to access your legal workspace
            </CardDescription>
          </CardHeader>

          <CardContent className="p-10 pt-0">
            <div className="space-y-7">
              {/* Enhanced Google Login */}
              <div className="relative">
                {isGoogleLoading && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-base font-semibold">Connecting...</span>
                    </div>
                  </div>
                )}
                <div className="w-full flex justify-center p-5 glass-card rounded-xl border-2 border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <GoogleLogin
                    onSuccess={onGoogleSuccess}
                    onError={onGoogleError}
                    useOneTap={false}
                    size="large"
                    width="100%"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full opacity-50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground font-medium">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

            {/* Email/Password Login */}
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="lawyer@firm.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-14 text-base glass-card border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    disabled={isLoading || isGoogleLoading}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-14 text-base pr-14 glass-card border-2 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    disabled={isLoading || isGoogleLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                    disabled={isLoading || isGoogleLoading}
                  />
                  <Label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/95 hover:to-primary/95 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift hover:scale-105"
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 p-8">
            <Separator className="opacity-50" />
            <p className="text-center text-base text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Enhanced Trust Indicators */}
        <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-base text-muted-foreground mb-6 font-semibold">
            Trusted by legal professionals worldwide
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2.5 glass-card px-4 py-2 rounded-full border-2 border-border/50 shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="w-2.5 h-2.5 bg-success rounded-full shadow-lg shadow-success/50"></div>
              <span className="font-semibold">Bank-level security</span>
            </div>
            <div className="flex items-center gap-2.5 glass-card px-4 py-2 rounded-full border-2 border-border/50 shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="w-2.5 h-2.5 bg-success rounded-full shadow-lg shadow-success/50"></div>
              <span className="font-semibold">Legal compliance</span>
            </div>
            <div className="flex items-center gap-2.5 glass-card px-4 py-2 rounded-full border-2 border-border/50 shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="w-2.5 h-2.5 bg-success rounded-full shadow-lg shadow-success/50"></div>
              <span className="font-semibold">Data protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}