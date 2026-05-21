import Link from "next/link";

import { AuthSubmitButton } from "@/app/auth/admin/_components/auth-submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10">
      <section className="flex w-full max-w-md flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <form className="flex flex-col gap-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Input type="hidden" name="role" value="admin" />
              </FieldGroup>

              <AuthSubmitButton mode="signup" />
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button asChild variant="link" className="h-auto px-0">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        </p>
      </section>
    </main>
  );
}
