
import { db } from "@/lib/db";


export default async function Page() {
  const users = await db.query.usersTable.findMany({});

  return (
    <div>
      {users.map((user) => user.name)}
    </div>
  )

}