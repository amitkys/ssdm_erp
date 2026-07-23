import { db } from "@/lib/db";

async function main() {
  const students = await db.query.AdmittedStudentTable.findMany({
    limit: 5,
    columns: { name: true, UAN: true, AadharNumber: true, email: true },
  });
  console.log(JSON.stringify(students, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
