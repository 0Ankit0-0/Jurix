import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleCheckbox } from "@/components/ui/simple-checkbox";
import { FormField } from "@/components/ui/form-field";
import { PasswordStrength } from "@/components/ui/password-strength";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
    Card, CardContent, CardDescription,
    CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Eye, EyeOff, Check, Loader2, UserPlus,
    Shield, Zap, FileText, Mail, Lock, User, Briefcase
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useFormValidation } from "@/hooks/useFormValidation";
import api from "@/services/api";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import WaveGridBackground from "@/components/ui/WaveGridBackground";

const validationRules = {
    firstName: ['required', 'name'],
    lastName: ['required', 'name'],
    email: ['required', 'email'],
    password: ['password'],
    confirmPassword: [
        'required',
        (value, values) => {
            if (value !== values.password) return 'Passwords do not match'
            return null
        }
    ],
    role: ['required'],
    terms: [
        (value) => {
            if (!value) return 'You must accept the terms and conditions'
            return null
        }
    ]
}

const roleOptions = [
    { value: "lawyer", label: "Lawyer", description: "Licensed attorney or solicitor" },
    { value: "paralegal", label: "Paralegal", description: "Legal assistant or paralegal" },
    { value: "law_student", label: "Law Student", description: "Currently studying law" },
    { value: "legal_researcher", label: "Legal Researcher", description: "Legal research specialist" },
    { value: "judge", label: "Judge", description: "Judicial officer" },
    { value: "legal_consultant", label: "Legal Consultant", description: "Independent legal advisor" },
    { value: "other", label: "Other", description: "Other legal professional" }
]

export default function SignupPage() {
    const { handleGoogleLogin } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const {
        values,
        errors,
        touched,
        isSubmitting,
        setIsSubmitting,
        validateForm,
        setValue,
        setFieldTouched,
        getFieldProps
    } = useFormValidation({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        terms: false
    }, validationRules)

    const onGoogleSuccess = async (credentialResponse) => {
        setIsGoogleLoading(true);
        try {
            const result = await handleGoogleLogin(credentialResponse);
            if (result.success) {
                toast.success(result.isNewUser ? 'Account created successfully!' : 'Welcome back!');
                setTimeout(() => navigate("/dashboard"), 1500);
            }
        } catch (error) {
            console.error('Google signup error:', error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const onGoogleError = () => {
        toast.error("Google signup failed. Please try again.");
        setIsGoogleLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors below");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post("/auth/signup", {
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim(),
                password: values.password,
                role: values.role
            });

            if (response.status === 201) {
                toast.success("Account created successfully! Please log in.");
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (error) {
            console.error("Signup error:", error);
            
            let errorMessage = 'Signup failed. Please try again.';
            if (error.response?.status === 409) {
                errorMessage = 'Email already registered. Please use a different email or try logging in.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Grid Background */}
            <WaveGridBackground />
            
            {/* Theme-aware gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_60%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.15),transparent_60%)] dark:bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.08),transparent_60%)]"></div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/8 rounded-full blur-2xl animate-float"></div>
            <div className="absolute bottom-32 right-16 w-40 h-40 bg-accent/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse-soft"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <UserPlus className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="font-heading text-fluid-xl font-bold text-foreground mb-3">
                        Join JURIX
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Create your account and revolutionize your legal practice
                    </p>
                </div>

                <Card className="glass-card border-0 shadow-2xl animate-slide-up">
                    <CardHeader className="space-y-2 p-8">
                        <CardTitle className="font-heading text-2xl font-semibold text-center">Create Account</CardTitle>
                        <CardDescription className="text-center text-base">
                            Get started with your free JURIX account today
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 pt-0">
                        {/* Google Signup */}
                        <div className="space-y-6">
                            <div className="relative">
                                {isGoogleLoading && (
                                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <LoadingSpinner size="sm" className="text-primary" />
                                            <span className="text-sm font-medium">Creating account...</span>
                                        </div>
                                    </div>
                                )}
                                <div className="w-full flex justify-center p-4 glass-card rounded-xl border border-border/50">
                                    <GoogleLogin
                                        onSuccess={onGoogleSuccess}
                                        onError={onGoogleError}
                                        text="signup_with"
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
                                        Or sign up with email
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    label="First Name"
                                    required
                                    error={touched.firstName ? errors.firstName : null}
                                >
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            {...getFieldProps('firstName')}
                                            placeholder="John"
                                            className="h-11 pl-10"
                                            disabled={isSubmitting || isGoogleLoading}
                                        />
                                    </div>
                                </FormField>

                                <FormField
                                    label="Last Name"
                                    required
                                    error={touched.lastName ? errors.lastName : null}
                                >
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            {...getFieldProps('lastName')}
                                            placeholder="Doe"
                                            className="h-11 pl-10"
                                            disabled={isSubmitting || isGoogleLoading}
                                        />
                                    </div>
                                </FormField>
                            </div>

                            {/* Email */}
                            <FormField
                                label="Email Address"
                                required
                                error={touched.email ? errors.email : null}
                                success={touched.email && !errors.email && values.email ? "Valid email address" : null}
                            >
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...getFieldProps('email')}
                                        type="email"
                                        placeholder="lawyer@firm.com"
                                        className="h-11 pl-10"
                                        disabled={isSubmitting || isGoogleLoading}
                                    />
                                </div>
                            </FormField>

                            {/* Role */}
                            <FormField
                                label="Professional Role"
                                required
                                error={touched.role ? errors.role : null}
                            >
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                    <Select
                                        value={values.role}
                                        onValueChange={(value) => {
                                            setValue('role', value)
                                            setFieldTouched('role', true)
                                        }}
                                        disabled={isSubmitting || isGoogleLoading}
                                    >
                                        <SelectTrigger className="h-11 pl-10">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roleOptions.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{role.label}</span>
                                                        <span className="text-xs text-muted-foreground">{role.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </FormField>

                            {/* Password */}
                            <FormField
                                label="Password"
                                required
                                error={touched.password ? errors.password : null}
                            >
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...getFieldProps('password')}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        className="h-11 pl-10 pr-10"
                                        disabled={isSubmitting || isGoogleLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isSubmitting || isGoogleLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </FormField>

                            {/* Password Strength */}
                            <PasswordStrength password={values.password} />

                            {/* Confirm Password */}
                            <FormField
                                label="Confirm Password"
                                required
                                error={touched.confirmPassword ? errors.confirmPassword : null}
                                success={touched.confirmPassword && !errors.confirmPassword && values.confirmPassword ? "Passwords match" : null}
                            >
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...getFieldProps('confirmPassword')}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className="h-11 pl-10 pr-10"
                                        disabled={isSubmitting || isGoogleLoading}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isSubmitting || isGoogleLoading}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </FormField>

                            {/* Terms */}
                            <FormField
                                error={touched.terms ? errors.terms : null}
                            >
                                <div className="flex items-start space-x-3">
                                    <SimpleCheckbox
                                        id="terms"
                                        checked={values.terms}
                                        onCheckedChange={(checked) => {
                                            setValue('terms', checked)
                                            setFieldTouched('terms', true)
                                        }}
                                        disabled={isSubmitting || isGoogleLoading}
                                        className="mt-1"
                                    />
                                    <Label htmlFor="terms" className="text-sm leading-5 cursor-pointer">
                                        I agree to the{" "}
                                        <Link to="/terms" className="text-primary hover:text-primary/80 font-medium">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link to="/privacy" className="text-primary hover:text-primary/80 font-medium">
                                            Privacy Policy
                                        </Link>
                                    </Label>
                                </div>
                            </FormField>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
                                disabled={isSubmitting || isGoogleLoading}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-5 w-5" />
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-6 p-8">
                        <Separator className="opacity-50" />
                        <p className="text-center text-base text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-primary hover:text-primary/80 font-semibold transition-colors"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                {/* Features */}
                <div className="mt-8 space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-center text-base font-semibold text-foreground">
                        What you'll get with JURIX:
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { icon: Zap, text: "AI-powered case simulations" },
                            { icon: FileText, text: "Advanced legal research tools" },
                            { icon: Shield, text: "Secure document management" }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 glass-card rounded-lg border border-border/30">
                                <div className="w-8 h-8 bg-gradient-to-br from-success/20 to-success/10 rounded-lg flex items-center justify-center">
                                    <feature.icon className="h-4 w-4 text-success" />
                                </div>
                                <span className="text-sm font-medium text-foreground">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}