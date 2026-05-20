import { InfoIcon } from "lucide-react";
import Link from "next/link";

import { AuthSubmitButton } from "@/app/auth/admin/_components/auth-submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-10">
      <section className="flex w-full max-w-md flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <form className="flex flex-col gap-6">
              <FieldGroup>
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </Field>
              </FieldGroup>

              <AuthSubmitButton mode="signin" />
            </form>
          </CardContent>
        </Card>

        {/* <p className="text-center text-sm text-muted-foreground">
          New to SSDM ERP?{" "}
          <Button asChild variant="link" className="h-auto px-0">
            <Link href="/auth/signup">Create an account</Link>
          </Button>
        </p> */}
      </section>
    </main>
  );
}
