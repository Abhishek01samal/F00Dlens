"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number | undefined;
  forceLookY?: number | undefined;
}

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full transition-transform duration-75"
      style={{
        width: size,
        height: size,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number | undefined;
  forceLookY?: number | undefined;
}

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-100"
      style={{
        width: size,
        height: isBlinking ? 4 : size,
        backgroundColor: eyeColor,
        borderRadius: isBlinking ? '2px' : '50%',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full transition-transform duration-75"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
          }}
        />
      )}
    </div>
  );
};

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp?: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin?: () => Promise<{ success: boolean; error?: string }>;
}

export function LoginPage({ onLogin, onSignUp, onGoogleLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Persisted theme should apply on login screen too (even after logout)
    try {
      const storedVars = localStorage.getItem("foodlens-theme-vars");
      const storedTheme = localStorage.getItem("foodlens-theme-id");
      if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);
      if (storedVars) {
        const vars = JSON.parse(storedVars) as Record<string, string>;
        Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking effect for purple character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000; // Random between 3-7 seconds

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150); // Blink duration 150ms
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Blinking effect for black character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000; // Random between 3-7 seconds

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150); // Blink duration 150ms
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Looking at each other animation when typing starts
  useEffect(() => {
    if (!isTyping) {
      setIsLookingAtEachOther(false);
      return;
    }
    setIsLookingAtEachOther(true);
    const timer = setTimeout(() => {
      setIsLookingAtEachOther(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [isTyping]);

  // Purple sneaky peeking animation when typing password and it's visible
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    }
    setIsPurplePeeking(false);
    return;
  }, [password, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (isSignUpMode && onSignUp) {
      const result = await onSignUp(email, password);
      if (!result.success) {
        setError(result.error || "Sign up failed. Please try again.");
      } else {
        // Auto-confirm is enabled, so auto-login after signup
        const loginResult = await onLogin(email, password);
        if (!loginResult.success) {
          setSuccessMessage("Account created! You can now log in.");
          setIsSignUpMode(false);
          setPassword("");
        }
      }
    } else {
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.error || "Invalid email or password. Please try again.");
      }
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!onGoogleLogin) {
      setError("Google sign-in is not configured.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsGoogleLoading(true);
    const result = await onGoogleLogin();
    if (!result.success) {
      setError(result.error || "Google sign-in failed. Please try again.");
    }
    setIsGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Content Section */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-8"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--background)) 50%, hsl(var(--accent) / 0.05) 100%)",
        }}
      >
        {/* Center title */}
        <div className="relative z-10 pt-4">
          <div className="w-full flex justify-center">
            <h1 className="font-pacifico text-7xl tracking-tight bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent drop-shadow-lg">
              FOODLENS
            </h1>
          </div>
        </div>

        <div className="flex-1 flex items-end justify-center relative">
          {/* Cartoon Characters */}
          <div className="relative w-full max-w-md h-[450px]">
            {/* Purple tall rectangle character */}
            <div
              ref={purpleRef}
              className="absolute left-[15%] bottom-0 w-24 transition-transform duration-300"
              style={{
                height:
                  (password.length > 0 && showPassword) ||
                  (isTyping || (password.length > 0 && !showPassword))
                    ? "440px"
                    : "400px",
                backgroundColor: "hsl(var(--primary))",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : isTyping || (password.length > 0 && !showPassword)
                      ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                      : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-3"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${20}px`
                      : isLookingAtEachOther
                        ? `${55}px`
                        : `${45 + purplePos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${35}px`
                      : isLookingAtEachOther
                        ? `${65}px`
                        : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall
                  size={26}
                  pupilSize={12}
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 4
                        : -4
                      : isLookingAtEachOther
                        ? 3
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 5
                        : -4
                      : isLookingAtEachOther
                        ? 4
                        : undefined
                  }
                />
                <EyeBall
                  size={26}
                  pupilSize={12}
                  isBlinking={isPurpleBlinking}
                  forceLookX={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 4
                        : -4
                      : isLookingAtEachOther
                        ? 3
                        : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword
                      ? isPurplePeeking
                        ? 5
                        : -4
                      : isLookingAtEachOther
                        ? 4
                        : undefined
                  }
                />
              </div>
            </div>

            {/* Black tall rectangle character */}
            <div
              ref={blackRef}
              className="absolute left-[35%] bottom-0 w-20 transition-transform duration-300"
              style={{
                height: "320px",
                backgroundColor: "#1a1a1a",
                borderRadius: "10px 10px 0 0",
                zIndex: 2,
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : isLookingAtEachOther
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                      : isTyping || (password.length > 0 && !showPassword)
                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                        : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-2"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? `${10}px`
                      : isLookingAtEachOther
                        ? `${32}px`
                        : `${26 + blackPos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? `${28}px`
                      : isLookingAtEachOther
                        ? `${12}px`
                        : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall
                  size={22}
                  pupilSize={10}
                  isBlinking={isBlackBlinking}
                  forceLookX={
                    password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined
                  }
                />
                <EyeBall
                  size={22}
                  pupilSize={10}
                  isBlinking={isBlackBlinking}
                  forceLookX={
                    password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined
                  }
                  forceLookY={
                    password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined
                  }
                />
              </div>
            </div>

            {/* Orange semi-circle character */}
            <div
              ref={orangeRef}
              className="absolute left-[5%] bottom-0 w-44 transition-transform duration-300"
              style={{
                height: "220px",
                backgroundColor: "hsl(var(--accent))",
                borderRadius: "180px 180px 0 0",
                zIndex: 3,
                transform:
                  password.length > 0 && showPassword
                    ? `skewX(0deg)`
                    : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-4"
                style={{
                  left: password.length > 0 && showPassword ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? `${85}px` : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil
                  size={14}
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
                <Pupil
                  size={14}
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
              </div>
            </div>

            {/* Yellow tall rectangle character */}
            <div
              ref={yellowRef}
              className="absolute right-[10%] bottom-0 w-24 transition-transform duration-300"
              style={{
                height: "280px",
                backgroundColor: "#FFEB3B",
                borderRadius: "10px 10px 0 0",
                zIndex: 2,
                transform:
                  password.length > 0 && showPassword ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-3"
                style={{
                  left: password.length > 0 && showPassword ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil
                  size={14}
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
                <Pupil
                  size={14}
                  forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                  forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                />
              </div>

              <div
                className="absolute w-10 h-1 bg-black rounded-full"
                style={{
                  left: password.length > 0 && showPassword ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <div className="px-6 py-3 rounded-2xl bg-primary/10">
              <h1 className="font-pacifico text-5xl tracking-tight text-foreground">FOODLENS</h1>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {isSignUpMode ? "Create account" : "Welcome back!"}
            </h2>
            <p className="text-muted-foreground">
              {isSignUpMode ? "Enter your details to get started" : "Please enter your details"}
            </p>
          </div>

          {/* Login/Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  className="h-14 pl-12 text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 pl-12 pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isSignUpMode && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-border" />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer select-none"
                  >
                    Remember for 30 days
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-sm text-primary">{successMessage}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-14 font-semibold text-base rounded-xl" disabled={isLoading}>
              {isLoading ? (isSignUpMode ? "Creating account..." : "Signing in...") : (isSignUpMode ? "Create Account" : "Log in")}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 font-semibold text-base rounded-xl flex items-center justify-center gap-3"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {/* Google G SVG logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isGoogleLoading ? "Signing in with Google..." : "Continue with Google"}
            </Button>
          </form>

          {/* Toggle Sign Up / Log In */}
          <p className="text-center text-sm text-muted-foreground pt-4">
            {isSignUpMode ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setError("");
                setSuccessMessage("");
              }}
              className="font-semibold text-primary hover:text-primary/80 transition-colors focus:outline-none"
            >
              {isSignUpMode ? "Log in" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
