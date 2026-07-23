import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MainSigninForm } from "./_components/main";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    const role = session.user.role;

    if (role === "student") {
      redirect("/student/dashboard");
    } else if (role === "admin" || role === "superAdmin") {
      redirect("/department");
    } else {
      redirect("/");
    }
  }

  return <MainSigninForm />;
}
