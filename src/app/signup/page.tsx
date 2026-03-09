"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AuthenticationService,
  DepartmentManagementService,
  RoleManagementService,
  ApiError,
} from "@/api";

/** Shape of items returned by department / designation / role list APIs */
interface SelectOption {
  _id: string;
  name: string;
}

export default function SignUpPage() {
  const router = useRouter();

  // ── Dropdown data (lazy-loaded) ──────────────────────────────────────
  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [designations, setDesignations] = useState<SelectOption[]>([]);
  const [roles, setRoles] = useState<SelectOption[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [desigLoading, setDesigLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const deptFetched = useRef(false);
  const roleFetched = useRef(false);

  // ── Form state ───────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    secondaryEmail: "",
    phoneNumber: "",
    employeeId: "",
    department: "",
    designation: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  // ── Submission state ─────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── Lazy-load: Departments (fetched when Select opens) ──────────────
  const loadDepartments = useCallback(async () => {
    if (deptFetched.current) return;
    setDeptLoading(true);
    try {
      const res = await DepartmentManagementService.departmentControllerFindAll({
        pageNo: 1,
        pageSize: 100,
      });
      const data = (res as { data?: { departments?: SelectOption[] } }).data;
      setDepartments(Array.isArray(data?.departments) ? data.departments : []);
      deptFetched.current = true;
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setDeptLoading(false);
    }
  }, []);

  // ── When a department is selected → fetch its designations ──────────
  const handleDeptSelect = useCallback(async (deptId: string) => {
    setFormData((prev) => ({ ...prev, department: deptId, designation: "" }));
    setDesignations([]);
    setDesigLoading(true);
    try {
      const res = await DepartmentManagementService.departmentControllerFindOne({ id: deptId });
      const data = (res as { data?: { designations?: SelectOption[] } }).data;
      setDesignations(Array.isArray(data?.designations) ? data.designations : []);
    } catch (err) {
      console.error("Failed to load designations for department:", err);
    } finally {
      setDesigLoading(false);
    }
  }, []);

  // ── Lazy-load: Roles (fetched when Select opens) ────────────────────
  const loadRoles = useCallback(async () => {
    if (roleFetched.current) return;
    setRoleLoading(true);
    try {
      const res = await RoleManagementService.roleControllerFindAll({
        pageNo: 1,
        pageSize: 100,
      });
      const data = (res as { data?: { roles?: SelectOption[] } }).data;
      setRoles(Array.isArray(data?.roles) ? data.roles : []);
      roleFetched.current = true;
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setRoleLoading(false);
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error when user edits
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const clearMessages = () => {
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);
  };

  // ── Client-side validation ───────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    if (!formData.employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (!formData.department) errors.department = "Please select a department";
    if (!formData.designation) errors.designation = "Please select a designation";
    if (!formData.role) errors.role = "Please select a role";
    if (!formData.password) errors.password = "Password is required";
    if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (!agreeTerms) errors.terms = "You must agree to the terms";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Form submission ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await AuthenticationService.authControllerRegister({
        requestBody: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          secondaryEmail: formData.secondaryEmail.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          employeeId: formData.employeeId.trim(),
          password: formData.password,
          department: formData.department,
          designation: formData.designation,
          role: formData.role,
        },
      });

      setSuccessMessage(result.message || "Account created successfully!");

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as {
          message?: string;
          error?: string;
          errors?: { field: string; message: string }[];
        };

        // Handle validation errors (field-level)
        if (body?.errors && Array.isArray(body.errors)) {
          const mapped: Record<string, string> = {};
          for (const fe of body.errors) {
            mapped[fe.field] = fe.message;
          }
          setFieldErrors(mapped);
          setErrorMessage(body.message || "Please fix the errors below.");
        } else {
          // Generic error (conflict, not-found, server error, etc.)
          setErrorMessage(body?.message || body?.error || "Registration failed. Please try again.");
        }
      } else {
        setErrorMessage("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Shared input class ──────────────────────────────────────────────
  const inputClass =
    "h-11 rounded-sm border-border bg-background text-sm focus-visible:ring-1 focus-visible:ring-[#044192]";
  const selectTriggerClass =
    "w-full h-11 rounded-sm border-border bg-background text-sm focus:ring-1 focus:ring-[#044192]";

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-[#044192] via-[#0a5eb8] to-[#1976d2] flex items-center justify-center p-4">
      {/* Signup Card */}
      <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl p-6 sm:p-8 md:p-10 my-8">
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-4 mb-4">
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

          {/* Signup Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#044192] mb-2">
            Create Account
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Hello there, create your new account
          </p>
        </div>

        {/* Global Messages */}
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <Input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={inputClass}
              required
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={inputClass}
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Secondary Email Input */}
          <div>
            <Input
              type="email"
              placeholder="Secondary Email"
              value={formData.secondaryEmail}
              onChange={(e) => handleInputChange("secondaryEmail", e.target.value)}
              className={inputClass}
            />
            {fieldErrors.secondaryEmail && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.secondaryEmail}</p>
            )}
          </div>

          {/* Phone Number Input */}
          <div>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className={inputClass}
              required
            />
            {fieldErrors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          {/* Employee ID Input */}
          <div>
            <Input
              type="text"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={(e) => handleInputChange("employeeId", e.target.value)}
              className={inputClass}
              required
            />
            {fieldErrors.employeeId && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.employeeId}</p>
            )}
          </div>

          {/* Department Select (lazy-loaded on open) */}
          <div>
            <Select
              value={formData.department}
              onValueChange={handleDeptSelect}
              onOpenChange={(open) => { if (open) loadDepartments(); }}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {deptLoading && (
                  <SelectItem value="__loading" disabled>
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                    </span>
                  </SelectItem>
                )}
                {departments.length === 0 && !deptLoading && deptFetched.current && (
                  <SelectItem value="__none" disabled>
                    No departments available
                  </SelectItem>
                )}
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.department && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.department}</p>
            )}
          </div>

          {/* Designation Select (populated from selected department) */}
          <div>
            <Select
              value={formData.designation}
              onValueChange={(value) => handleInputChange("designation", value)}
              disabled={!formData.department || desigLoading}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue
                  placeholder={
                    !formData.department
                      ? "Select department first"
                      : desigLoading
                      ? "Loading designations..."
                      : "Designation"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {desigLoading && (
                  <SelectItem value="__loading" disabled>
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                    </span>
                  </SelectItem>
                )}
                {designations.length === 0 && !desigLoading && formData.department && (
                  <SelectItem value="__none" disabled>
                    No designations available
                  </SelectItem>
                )}
                {designations.map((desig) => (
                  <SelectItem key={desig._id} value={desig._id}>
                    {desig.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.designation && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.designation}</p>
            )}
          </div>

          {/* Role Select (lazy-loaded on open) */}
          <div>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
              onOpenChange={(open) => { if (open) loadRoles(); }}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roleLoading && (
                  <SelectItem value="__loading" disabled>
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                    </span>
                  </SelectItem>
                )}
                {roles.length === 0 && !roleLoading && roleFetched.current && (
                  <SelectItem value="__none" disabled>
                    No roles available
                  </SelectItem>
                )}
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.role && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.role}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
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

          {/* Confirm Password Input */}
          <div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
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

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked: boolean) => setAgreeTerms(checked)}
              className="h-4 w-4 rounded border-border data-[state=checked]:bg-[#044192] data-[state=checked]:border-[#044192] mt-0.5"
              required
            />
            <label
              htmlFor="terms"
              className="text-xs sm:text-sm text-muted-foreground cursor-pointer select-none leading-tight"
            >
              By creating an account you agree to our{" "}
              <Link
                href="/terms"
                className="text-[#044192] hover:underline font-medium"
              >
                Term and Conditions
              </Link>
            </label>
          </div>
          {fieldErrors.terms && (
            <p className="text-xs text-red-600 pl-6">{fieldErrors.terms}</p>
          )}

          {/* Sign Up Button */}
          <div className="max-w-sm mx-auto pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-sm bg-[#8FA3C1] hover:bg-[#044192] text-white font-medium text-sm transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Have an account?{" "}
              <Link
                href="/login"
                className="text-[#044192] hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
