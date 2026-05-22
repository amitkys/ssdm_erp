import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <div>
      {/* condition check session exist or not */}
      {session?.user ? (
        <div>
          <p>user name: {session.user.name}</p>
          <p>user email: {session.user.email}</p>
          <p>role: {session.user.role}</p>
        </div>
      ) : (
        <div>
          <p>Session not exist</p>
        </div>
      )}
    </div>
  )
}