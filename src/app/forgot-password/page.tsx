"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthenticationService, ApiError } from "@/api";
import { getDeviceId } from "@/hooks/useDeviceId";

type Step = "email" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // ── Step management ───────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("email");

  // ── Email step state ──────────────────────────────────────────────────
  const [email, setEmail] = useState("");

  // ── Reset step state ──────────────────────────────────────────────────
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Shared state ──────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ── Helper: parse API error body ──────────────────────────────────────
  const handleApiError = (err: unknown) => {
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
      // 429 – Too many requests
      else if (err.status === 429) {
        setErrorMessage(body?.message || "Too many requests. Please wait and try again.");
      }
      // Other API errors
      else {
        setErrorMessage(body?.message || body?.error || "Something went wrong. Please try again.");
      }
    } else {
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setFieldErrors({ email: "Email is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await AuthenticationService.authControllerForgot({
        xDeviceId: getDeviceId(),
        requestBody: { email: email.trim() },
      });

      setSuccessMessage(result.message || "OTP sent successfully! Check your email.");
      // Move to reset step after a short delay so user sees the success message
      setTimeout(() => {
        setSuccessMessage(null);
        setStep("reset");
      }, 1500);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Reset Password ────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!otp.trim()) errors.otp = "OTP is required";
    if (!newPassword) errors.newPassword = "New password is required";
    else if (newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
    if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await AuthenticationService.authControllerReset({
        xDeviceId: getDeviceId(),
        requestBody: {
          otp: otp.trim(),
          newPassword,
        },
      });

      setSuccessMessage(result.message || "Password reset successful!");

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────────────
  const inputClass =
    "h-11 rounded-sm border-border bg-background text-sm focus-visible:ring-1 focus-visible:ring-[#044192]";

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-[#044192] via-[#0a5eb8] to-[#1976d2] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl p-6 sm:p-8 md:p-10 my-8">
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full">
              <Image
                src="/logo2.png"
                alt="FB International BD"
                width={224}
                height={224}
                className="h-full w-full object-contain"
              />
            </div>
            <h2 className="text-xl font-medium text-[#044192]">
              FB International BD
            </h2>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#044192] mb-2">
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            {step === "email"
              ? "Enter your email address and we'll send you an OTP to reset your password"
              : "Enter the OTP sent to your email and choose a new password"}
          </p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* ─── Step 1: Email Form ─────────────────────────────────────── */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                className={inputClass}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div className="max-w-sm mx-auto pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-sm bg-[#8FA3C1] hover:bg-[#044192] text-white font-medium text-sm transition-colors disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#044192] hover:underline font-medium"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* ─── Step 2: OTP + New Password Form ───────────────────────── */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* OTP Input */}
            <div>
              <Input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  clearFieldError("otp");
                }}
                className={inputClass}
                maxLength={6}
                required
              />
              {fieldErrors.otp && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.otp}</p>
              )}
            </div>

            {/* New Password Input */}
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearFieldError("newPassword");
                  }}
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
              {fieldErrors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  className={`${inputClass} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Resend OTP link */}
            <div className="text-right">
              <button
                type="button"
                disabled={isSubmitting}
                className="text-xs sm:text-sm text-[#044192] hover:underline font-medium disabled:opacity-50"
                onClick={async () => {
                  clearMessages();
                  setIsSubmitting(true);
                  try {
                    const result = await AuthenticationService.authControllerForgot({
                      xDeviceId: getDeviceId(),
                      requestBody: { email: email.trim() },
                    });
                    setSuccessMessage(result.message || "OTP resent successfully!");
                  } catch (err) {
                    handleApiError(err);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Resend OTP
              </button>
            </div>

            <div className="max-w-sm mx-auto pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-sm bg-[#8FA3C1] hover:bg-[#044192] text-white font-medium text-sm transition-colors disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground font-medium"
                onClick={() => {
                  clearMessages();
                  setStep("email");
                }}
              >
                <ArrowLeft className="h-3 w-3" />
                Change Email
              </button>
              <Link
                href="/login"
                className="text-xs sm:text-sm text-[#044192] hover:underline font-medium"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
