"use client";

import { LogInIcon, UserPlusIcon } from "lucide-react";
import { type MouseEvent, useState } from "react";
import { signinSchema } from "@/app/auth/admin/signin/lib/zod-type/signin-type";
import { signupSchema } from "@/app/auth/admin/signup/lib/zod-type/signup-type";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/auth-client";

type AuthSubmitButtonProps = {
  mode: "signin" | "signup";
};

function getRequiredForm(button: HTMLButtonElement) {
  const form = button.form;

  if (!form) {
    throw new Error("Auth form is missing");
  }

  return form;
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getValidationMessage(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Check your details and try again";
}

export function AuthSubmitButton({ mode }: AuthSubmitButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const form = getRequiredForm(event.currentTarget);
      const formData = new FormData(form);

      if (mode === "signin") {
        const result = signinSchema.safeParse({
          email: getFormValue(formData, "email"),
          password: getFormValue(formData, "password"),
        });

        if (!result.success) {
          alert(getValidationMessage(result.error));
          return;
        }

        await signIn.email(
          {
            ...result.data,
            callbackURL: "/",
          },
          {
            onSuccess: () => {
              alert("Signed in successfully");
              window.location.href = "/";
            },
            onError: (ctx) => {
              alert(ctx.error.message || "Unable to sign in");
            },
          },
        );

        return;
      }

      const result = signupSchema.safeParse({
        name: getFormValue(formData, "name"),
        email: getFormValue(formData, "email"),
        password: getFormValue(formData, "password"),
        confirmPassword: getFormValue(formData, "confirmPassword"),
        role: "admin",
      });

      if (!result.success) {
        alert(getValidationMessage(result.error));
        return;
      }

      await signUp.email(
        {
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
          role: result.data.role,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            alert("Account created successfully");
            window.location.href = "/auth/signin";
          },
          onError: (ctx) => {
            alert(ctx.error.message || "Unable to create account");
          },
        },
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  const Icon = mode === "signin" ? LogInIcon : UserPlusIcon;
  const label = mode === "signin" ? "Sign in" : "Create account";
  const submittingLabel = mode === "signin" ? "Signing in..." : "Creating...";

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={isSubmitting}
      onClick={handleClick}
    >
      <Icon data-icon="inline-start" />
      {isSubmitting ? submittingLabel : label}
    </Button>
  );
}
