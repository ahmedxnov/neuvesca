import { createClient } from "@/lib/supabase/server";
import UsersAdminClient from "./UsersAdminClient";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <header className="adminPageHead">
        <div>
          <p className="eyebrow">Users</p>
          <h1>Customer accounts.</h1>
          <p>
            Edit names, phone numbers and roles, or remove accounts that have no
            orders attached. New customers sign themselves up at{" "}
            <code>/signup</code>.
          </p>
        </div>
      </header>

      {error ? (
        <div className="adminCard adminToast">{error.message}</div>
      ) : (
        <UsersAdminClient initialUsers={data ?? []} />
      )}
    </>
  );
}
