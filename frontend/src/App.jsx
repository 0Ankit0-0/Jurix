import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from "./components/ui/error-boundary";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import Navbar from "./components/homepageComponents/navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/ui/page-transition";
import ProcessingScreen from "./components/simulation/ProcessingScreen";
import WaveGridBackground from "./components/ui/WaveGridBackground";
import { monitorWebVitals, logPageView } from "./utils/monitoring";
import { registerServiceWorker } from "./utils/serviceWorker";

// Lazy load components for better performance with retry logic
import { lazyWithRetry } from "./utils/performance";

const Dashboard = lazyWithRetry(() => import("./pages/Dashboard/dashboard"));
const Home = lazyWithRetry(() => import("./pages/home/home"));
const CreateCase = lazyWithRetry(() => import("./components/Case/CaseForm"));
const ChatbotPage = lazyWithRetry(() => import("./components/chatbot/chatbot"));
const ReplaySimulation = lazyWithRetry(() => import("./components/simulation/ReplaySimulation"));
const LiveSimulation = lazyWithRetry(() => import("./components/simulation/LiveSimulation"));
const ReviewScreen = lazyWithRetry(() => import("./components/simulation/ReviewScreen"));
const ProfilePage = lazyWithRetry(() => import("./components/homepageComponents/profile"));
const LoginPage = lazyWithRetry(() => import("./pages/forms/login"));
const SignupPage = lazyWithRetry(() => import("./pages/forms/signUp"));
const PublicCases = lazyWithRetry(() => import("./pages/PublicCases/PublicCases"));
const CaseDiscussions = lazyWithRetry(() => import("./pages/CaseDiscussions/CaseDiscussions"));

// Loading fallback component with animation
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4 animate-fade-in">
      <LoadingSpinner size="xl" className="text-primary mx-auto" />
      <p className="text-muted-foreground animate-pulse-soft">Loading...</p>
    </div>
  </div>
);

// Animated Routes wrapper
function AnimatedRoutes() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user_data") || "null");
  const name = user ? user.name : "Guest";

  // Track page views for analytics
  useEffect(() => {
    logPageView(location.pathname);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Public Routes */}
        <Route
          path="/home"
          element={
            <ErrorBoundary fallbackMessage="Failed to load home page">
              <PageTransition>
                <Home />
              </PageTransition>
            </ErrorBoundary>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ErrorBoundary fallbackMessage="Failed to load dashboard">
              <PageTransition>
                <Dashboard userName={name} />
              </PageTransition>
            </ErrorBoundary>
          }
        />

        <Route
          path="/public-cases"
          element={
            <ErrorBoundary fallbackMessage="Failed to load public cases">
              <PageTransition>
                <PublicCases />
              </PageTransition>
            </ErrorBoundary>
          }
        />

        <Route
          path="/case/:caseId/discussions"
          element={
            <ErrorBoundary fallbackMessage="Failed to load discussions">
              <PageTransition>
                <CaseDiscussions />
              </PageTransition>
            </ErrorBoundary>
          }
        />

        <Route
          path="/login"
          element={
            <ErrorBoundary fallbackMessage="Failed to load login page">
              <PageTransition>
                <LoginPage />
              </PageTransition>
            </ErrorBoundary>
          }
        />

        <Route
          path="/signup"
          element={
            <ErrorBoundary fallbackMessage="Failed to load signup page">
              <PageTransition>
                <SignupPage />
              </PageTransition>
            </ErrorBoundary>
          }
        />

        {/* Protected Routes */}

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ErrorBoundary fallbackMessage="Failed to load chatbot">
                <PageTransition>
                  <ChatbotPage />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/case"
          element={
            <ProtectedRoute>
              <ErrorBoundary fallbackMessage="Failed to load case creation page">
                <PageTransition>
                  <CreateCase />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/case/:caseId/process"
          element={
            <ProtectedRoute>
              <ErrorBoundary fallbackMessage="Failed to load processing screen">
                <PageTransition>
                  <ProcessingScreen />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/case/:caseId/review"
          element={
            <ProtectedRoute>
              <ErrorBoundary fallbackMessage="Failed to load review screen">
                <PageTransition>
                  <ReviewScreen />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulation/:id"
          element={
            <ProtectedRoute>
              <ErrorBoundary fallbackMessage="Failed to load simulation replay">
                <PageTransition>
                  <ReplaySimulation />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulation/start/:caseId"
          element={
            <ProtectedRoute>
              <ErrorBoundary fallbackMessage="Failed to load live simulation">
                <PageTransition>
                  <LiveSimulation />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulation/replay/:caseId"
          element={
            <ProtectedRoute>
              <ErrorBoundary fallbackMessage="Failed to load simulation replay">
                <PageTransition>
                  <ReplaySimulation />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ErrorBoundary fallbackMessage="Failed to load profile">
                <PageTransition>
                  <ProfilePage userId={user?._id} />
                </PageTransition>
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // Initialize performance monitoring and service worker
  useEffect(() => {
    monitorWebVitals();
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary fallbackMessage="Something went wrong with the application. Please refresh the page.">
      <Router>
        <BackgroundWrapper />
        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}

function BackgroundWrapper() {
  const location = useLocation();

  // Paths with specific backgrounds to avoid overlap with global WaveGridBackground
  const pathsWithSpecificBg = [
    "/public-cases",
    
    "/case",
    "/simulation",
    "/process",
    "/review",
    "/login",
    "/signup"
  ];

  const hasSpecificBg = pathsWithSpecificBg.some(path => location.pathname.startsWith(path));

  return !hasSpecificBg ? <WaveGridBackground /> : null;
}

export default App;
