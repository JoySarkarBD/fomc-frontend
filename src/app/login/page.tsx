"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthenticationService, ApiError } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/components/shared/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [isNotRobot, setIsNotRobot] = useState(false);

  // ── Submission / error state ──────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearErrors = () => {
    setErrorMessage(null);
    setFieldErrors({});
  };

  // ── Submit handler ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Basic client-side guard
    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await AuthenticationService.authControllerLogin({
        requestBody: { email: email.trim(), password },
      });

      // ── Success: extract token + user from response ───────────────────
      const data = (result as { data?: { accessToken?: string; user?: AuthUser } }).data;
      const token = data?.accessToken;
      const user = data?.user;

      if (token && user) {
        login(token, user);
      }

      // Redirect to dashboard
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as {
          message?: string;
          error?: string;
          errors?: { field: string; message: string }[];
        };

        // 400 – Validation errors (field-level)
        if (body?.errors && Array.isArray(body.errors)) {
          const mapped: Record<string, string> = {};
          for (const fe of body.errors) {
            mapped[fe.field] = fe.message;
          }
          setFieldErrors(mapped);
          setErrorMessage(body.message || "Validation failed. Please fix the errors below.");
        }
        // 401 – Invalid credentials
        else if (err.status === 401) {
          setErrorMessage(body?.message || "Invalid email or password.");
        }
        // 500 / other
        else {
          setErrorMessage(body?.message || body?.error || "Login failed. Please try again.");
        }
      } else {
        setErrorMessage("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared input class ────────────────────────────────────────────────
  const inputClass =
    "h-11 rounded-sm border-border bg-background text-sm focus-visible:ring-1 focus-visible:ring-[#044192]";

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-[#044192] via-[#0a5eb8] to-[#1976d2] flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6 sm:p-8 md:p-10">
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-6">
            {/* Logo */}
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full">
              <Image
                src="/logo2.png"
                alt="FB International BD"
                width={224}
                height={224}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Company Name */}
            <h2 className="text-xl font-medium text-[#044192]">
              FB International BD
            </h2>
          </div>

          {/* Login Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#044192] mb-2">
            Login to Account
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Please enter your email and password to continue
          </p>
        </div>

        {/* Global Error Message */}
        {errorMessage && (
          <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
              className={inputClass}
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
                className={`${inputClass} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {/* Remember Password and Forget Password Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberPassword}
                onCheckedChange={(checked: boolean) =>
                  setRememberPassword(checked)
                }
                className="h-4 w-4 rounded border-border data-[state=checked]:bg-[#044192] data-[state=checked]:border-[#044192]"
              />
              <label
                htmlFor="remember"
                className="text-xs sm:text-sm text-muted-foreground cursor-pointer select-none"
              >
                Remember Password
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm text-[#044192] hover:underline font-medium"
            >
              Forget Password?
            </Link>
          </div>

          {/* reCAPTCHA Placeholder */}
          {/* <div className="max-w-60 mx-auto my-6">
            <div className="flex items-center gap-3 border border-border rounded-sm px-4 py-2 sm:p-6 bg-background">
              <Checkbox
                id="robot"
                checked={isNotRobot}
                onCheckedChange={(checked: boolean) => setIsNotRobot(checked)}
                className="h-5 w-5 rounded border-border data-[state=checked]:bg-[#044192] data-[state=checked]:border-[#044192]"
              />
              <label
                htmlFor="robot"
                className="text-sm text-gray-500 cursor-pointer select-none"
              >
                I'm not a robot
              </label>
              <div className="ml-auto">
                <Image
                  src="/icons/recaptcha-icons.png"
                  alt="reCAPTCHA"
                  width={332}
                  height={332}
                  className="h-14 w-14"
                />
              </div>
            </div>
          </div> */}

          {/* Sign In Button */}
          <div className="max-w-sm mx-auto">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-sm bg-[#8FA3C1] hover:bg-[#044192] text-white font-medium text-sm transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#044192] hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
