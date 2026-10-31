"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { AuthInput, PasswordInput } from "@/components/auth/auth-fields";
import {
  forgotPasswordSchema,
  getErrorMessages,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type LoginValues,
  type RegisterValues,
  type ResetPasswordValues,
} from "@/lib/validations";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import logo from "../../public/images/image 14.png";

/* ---------- Helper: send JSON to one of our API routes ---------- */
async function postJson(url: string, data: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json().catch(() => ({})); // empty object if the reply isn't JSON
  return { ok: response.ok, status: response.status, json };
}

/* ---------- Red message above the submit button ---------- */
function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-[16px] text-[14px] leading-[20px] text-[#D92D20]">
      {message}
    </p>
  );
}

/* ---------- Log in form ---------- */
function LoginForm() {
  const logIn = useAuthStore((state) => state.logIn);
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onValid(data: LoginValues) {
    setFormError(null);
    const { ok, json } = await postJson("/api/auth/login", data);

    if (!ok) {
      setFormError(json.message ?? "Something went wrong. Please try again.");
      return;
    }

    console.log("✅ Logged in:", json.user.email); // never log passwords
    logIn(json.user);
    closeAuthModal();
  }

  function onInvalid(formErrors: FieldErrors<LoginValues>) {
    console.log("❌ Log in form errors:", getErrorMessages(formErrors));
  }

  return (
    <div className="text-center">
      <h2 className="mt-[32px] text-[20px] font-medium uppercase leading-[26px] text-black">
        Welcome back to Lunexa
      </h2>
      <p className="mx-auto mt-[12px] max-w-[330px] text-[15px] leading-[22px] text-[#1A1A1A]">
        Shop your styles, save top picks to your wishlist, track those orders &amp; train with us.
      </p>

      <form
        onSubmit={handleSubmit(onValid, onInvalid)}
        noValidate
        className="mt-[40px] flex flex-col gap-[12px]"
      >
        <AuthInput
          {...register("email")}
          type="email"
          placeholder="Email"
          autoComplete="email"
          error={errors.email?.message}
        />
        <PasswordInput
          {...register("password")}
          placeholder="Password"
          autoComplete="current-password"
          error={errors.password?.message}
        />

        <button
          type="button"
          onClick={() => openAuthModal("forgot")}
          className="mx-auto mt-[8px] text-[13px] font-semibold text-black underline underline-offset-[2px] hover:opacity-70"
        >
          Forgot password?
        </button>

        <FormError message={formError} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-[32px] h-[48px] w-full rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
        >
          {isSubmitting ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="mt-[16px] text-[15px] text-[#1A1A1A]">
        Don’t have an account?{" "}
        <button
          type="button"
          onClick={() => openAuthModal("register")}
          className="font-bold text-black hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

/* ---------- Sign up form ---------- */
function RegisterForm() {
  const logIn = useAuthStore((state) => state.logIn);
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onValid(data: RegisterValues) {
    setFormError(null);
    const { ok, status, json } = await postJson("/api/auth/register", data);

    if (!ok) {
      if (status === 409) {
        // Email already used: show it under the email box
        setError("email", { message: json.message });
      } else if (status === 400 && json.errors) {
        // Server validation: show each message under its own box
        for (const [field, messages] of Object.entries(json.errors as Record<string, string[]>)) {
          setError(field as keyof RegisterValues, { message: messages[0] });
        }
      } else {
        setFormError(json.message ?? "Something went wrong. Please try again.");
      }
      return;
    }

    console.log("✅ Account created:", json.user.email); // never log passwords
    logIn(json.user); // the server already set the login cookie
    closeAuthModal();
  }

  function onInvalid(formErrors: FieldErrors<RegisterValues>) {
    console.log("❌ Sign up form errors:", getErrorMessages(formErrors));
  }

  // Date of Birth shows a placeholder until focused, then becomes a date picker
  const dateOfBirthField = register("dateOfBirth");

  return (
    <div className="text-center">
      <h2 className="mt-[32px] text-[20px] font-medium uppercase leading-[26px] text-black">
        Get started with Lunexa
      </h2>
      <p className="mx-auto mt-[12px] max-w-[320px] text-[15px] leading-[22px] text-[#1A1A1A]">
        One account, across all apps, just to make things a little easier.
      </p>

      <form
        onSubmit={handleSubmit(onValid, onInvalid)}
        noValidate
        className="mt-[40px] flex flex-col gap-[16px]"
      >
        <AuthInput
          {...register("firstName")}
          placeholder="First Name"
          autoComplete="given-name"
          error={errors.firstName?.message}
        />
        <AuthInput
          {...register("lastName")}
          placeholder="Last Name"
          autoComplete="family-name"
          error={errors.lastName?.message}
        />
        <AuthInput
          {...dateOfBirthField}
          type="text"
          placeholder="Date of Birth"
          autoComplete="bday"
          onFocus={(e) => {
            e.target.type = "date";
          }}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = "text";
            dateOfBirthField.onBlur(e); // keep react-hook-form's own blur handling
          }}
          error={errors.dateOfBirth?.message}
        />
        <AuthInput
          {...register("email")}
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          error={errors.email?.message}
        />
        <PasswordInput
          {...register("password")}
          placeholder="Password"
          autoComplete="new-password"
          error={errors.password?.message}
        />

        <FormError message={formError} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-[24px] h-[48px] w-full rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-[16px] text-[15px] text-[#1A1A1A]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="font-bold text-black hover:underline"
        >
          Log In
        </button>
      </p>
    </div>
  );
}

/* ---------- Forgot password form ---------- */
function ForgotPasswordForm() {
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onValid(data: ForgotPasswordValues) {
    setFormError(null);
    const { ok, json } = await postJson("/api/auth/forgot-password", data);

    if (!ok) {
      setFormError(json.message ?? "Something went wrong. Please try again.");
      return;
    }
    setSentMessage(json.message);
  }

  return (
    <div className="text-center">
      <h2 className="mt-[32px] text-[20px] font-medium uppercase leading-[26px] text-black">
        Forgot your password?
      </h2>

      {sentMessage ? (
        /* After sending: "check your email" */
        <>
          <p className="mx-auto mt-[12px] max-w-[360px] text-[15px] leading-[22px] text-[#1A1A1A]">
            {sentMessage} The link expires in 1 hour.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="mt-[40px] h-[48px] w-full rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            Back to Log In
          </button>
        </>
      ) : (
        /* Before sending: email box */
        <>
          <p className="mx-auto mt-[12px] max-w-[330px] text-[15px] leading-[22px] text-[#1A1A1A]">
            Enter the email you signed up with and we’ll send you a link to reset your password.
          </p>

          <form
            onSubmit={handleSubmit(onValid)}
            noValidate
            className="mt-[40px] flex flex-col gap-[12px]"
          >
            <AuthInput
              {...register("email")}
              type="email"
              placeholder="Email"
              autoComplete="email"
              error={errors.email?.message}
            />

            <FormError message={formError} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-[32px] h-[48px] w-full rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-[16px] text-[15px] text-[#1A1A1A]">
            Remembered it?{" "}
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="font-bold text-black hover:underline"
            >
              Log In
            </button>
          </p>
        </>
      )}
    </div>
  );
}

/* ---------- Reset password form (opened from the email link) ---------- */
function ResetPasswordForm() {
  const token = useAuthStore((state) => state.resetToken);
  const logIn = useAuthStore((state) => state.logIn);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onValid(data: ResetPasswordValues) {
    setFormError(null);
    const { ok, json } = await postJson("/api/auth/reset-password", {
      token,
      password: data.password,
    });

    if (!ok) {
      setFormError(json.message ?? "Something went wrong. Please try again.");
      return;
    }

    logIn(json.user); // the server already logged them in
    setDone(true);
  }

  /* Success */
  if (done) {
    return (
      <div className="text-center">
        <h2 className="mt-[32px] text-[20px] font-medium uppercase leading-[26px] text-black">
          Password updated
        </h2>
        <p className="mx-auto mt-[12px] max-w-[330px] text-[15px] leading-[22px] text-[#1A1A1A]">
          You’re logged in with your new password.
        </p>
        <button
          type="button"
          onClick={closeAuthModal}
          className="mt-[40px] h-[48px] w-full rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  /* New password form */
  return (
    <div className="text-center">
      <h2 className="mt-[32px] text-[20px] font-medium uppercase leading-[26px] text-black">
        Choose a new password
      </h2>
      <p className="mx-auto mt-[12px] max-w-[330px] text-[15px] leading-[22px] text-[#1A1A1A]">
        At least 8 characters, with one uppercase letter and one number.
      </p>

      <form
        onSubmit={handleSubmit(onValid)}
        noValidate
        className="mt-[40px] flex flex-col gap-[12px]"
      >
        <PasswordInput
          {...register("password")}
          placeholder="New Password"
          autoComplete="new-password"
          error={errors.password?.message}
        />
        <PasswordInput
          {...register("confirmPassword")}
          placeholder="Confirm New Password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />

        {formError && (
          <p role="alert" className="mt-[16px] text-[14px] leading-[20px] text-[#D92D20]">
            {formError}{" "}
            <button
              type="button"
              onClick={() => openAuthModal("forgot")}
              className="font-semibold underline underline-offset-[2px]"
            >
              Request a new link
            </button>
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-[32px] h-[48px] w-full rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save New Password"}
        </button>
      </form>
    </div>
  );
}

const dialogLabels = {
  login: "Log in",
  register: "Create account",
  forgot: "Forgot password",
  reset: "Choose a new password",
} as const;

/* ---------- Log in / Sign up / Forgot / Reset modal ---------- */
export default function AuthModal() {
  const view = useAuthStore((state) => state.authModal);
  const close = useAuthStore((state) => state.closeAuthModal);

  // Once, when the site loads
  useEffect(() => {
    // 1. Ask the server who is really logged in
    useAuthStore.getState().checkSession();

    // 2. Opened from a reset email (/?reset=TOKEN)? Show the "new password" view
    const url = new URL(window.location.href);
    const resetToken = url.searchParams.get("reset");
    if (resetToken) {
      useAuthStore.getState().openResetModal(resetToken);
      // Remove the token from the address bar (and browser history)
      url.searchParams.delete("reset");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }, []);

  useEffect(() => {
    if (!view) return;

    // Close with the Escape key
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);

    // Stop the page behind the modal from scrolling
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [view, close]);

  if (!view) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-[16px] py-[24px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabels[view]}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-full w-full max-w-[640px] overflow-y-auto rounded-[12px] bg-white px-[24px] pb-[40px] pt-[48px] sm:px-[72px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-[20px] top-[20px] text-black transition-opacity hover:opacity-60"
        >
          <X strokeWidth={1.5} className="size-[24px]" />
        </button>

        <div className="flex justify-center">
          <Image src={logo} alt="Lunexa" className="h-[40px] w-auto dark:invert" />
        </div>

        {/* key makes React build a fresh form when switching, so old errors don't carry over */}
        {view === "login" && <LoginForm key="login" />}
        {view === "register" && <RegisterForm key="register" />}
        {view === "forgot" && <ForgotPasswordForm key="forgot" />}
        {view === "reset" && <ResetPasswordForm key="reset" />}
      </div>
    </div>
  );
}

/* ---------- Log out confirmation modal ---------- */
export function LogoutModal() {
  const isOpen = useAuthStore((state) => state.isLogoutModalOpen);
  const close = useAuthStore((state) => state.closeLogoutModal);
  const logOut = useAuthStore((state) => state.logOut);
  const closeWishlistPopup = useWishlistStore((state) => state.closePopup);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  async function handleLogOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" }); // deletes the login cookie
    } catch {
      // Even if this fails, clear the UI below
    }
    logOut();
    closeWishlistPopup();
    close();
    console.log("👋 Logged out");
  }

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-[16px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] rounded-[12px] bg-white px-[24px] pb-[36px] pt-[56px] text-center sm:px-[40px]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-[20px] top-[20px] text-black transition-opacity hover:opacity-60"
        >
          <X strokeWidth={1.5} className="size-[24px]" />
        </button>

        <h2
          id="logout-title"
          className="text-[20px] font-medium uppercase leading-[26px] text-black"
        >
          Are you sure you want to log out?
        </h2>

        <div className="mt-[28px] flex flex-col gap-[12px]">
          <button
            type="button"
            onClick={close}
            className="flex h-[48px] w-full items-center justify-center gap-[8px] rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            <span aria-hidden="true">😂</span>
            No, I’m just kidding
          </button>
          <button
            type="button"
            onClick={handleLogOut}
            className="h-[48px] w-full rounded-full bg-[#EBEBEB] text-[16px] font-semibold text-black transition-colors hover:bg-[#DCDCDC]"
          >
            Yes, I want to log out
          </button>
        </div>
      </div>
    </div>
  );
}