"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { AuthInput, PasswordInput } from "@/components/auth/auth-fields";
import {
  getErrorMessages,
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validations";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import logo from "../../public/images/image 14.png";

/* ---------- Log in form ---------- */
function LoginForm() {
  const logIn = useAuthStore((state) => state.logIn);
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  function onValid(data: LoginValues) {
    // Never log passwords, even during development
    console.log("✅ Log in successful:", { email: data.email });
    // Backend phase: check the email + password with our API here.
    logIn({ email: data.email });
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

        <Link
          href="/forgot-password"
          onClick={closeAuthModal}
          className="mx-auto mt-[8px] text-[13px] font-semibold text-black underline underline-offset-[2px] hover:opacity-70"
        >
          Forgot password?
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-[32px] h-[48px] w-full rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
        >
          Log In
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  function onValid(data: RegisterValues) {
    // Never log passwords, even during development
    console.log("✅ Sign up successful:", {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      email: data.email,
    });
    // Backend phase: send `data` to our API here.
    logIn({ firstName: data.firstName, lastName: data.lastName, email: data.email });
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-[24px] h-[48px] w-full rounded-full bg-black text-[16px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
        >
          Create Account
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

/* ---------- Log in / Sign up modal ---------- */
export default function AuthModal() {
  const view = useAuthStore((state) => state.authModal);
  const close = useAuthStore((state) => state.closeAuthModal);

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
        aria-label={view === "login" ? "Log in" : "Create account"}
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
          <Image src={logo} alt="Lunexa" className="h-[40px] w-auto" />
        </div>

        {/* key makes React build a fresh form when switching, so old errors don't carry over */}
        {view === "login" ? <LoginForm key="login" /> : <RegisterForm key="register" />}
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

  function handleLogOut() {
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