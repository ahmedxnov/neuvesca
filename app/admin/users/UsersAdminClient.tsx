"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
};

type Form = {
  full_name: string;
  phone: string;
  role: string;
};

function blankForm(): Form {
  return { full_name: "", phone: "", role: "customer" };
}

function toForm(u: UserRow): Form {
  return {
    full_name: u.full_name ?? "",
    phone: u.phone ?? "",
    role: u.role || "customer",
  };
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-EG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function UsersAdminClient({
  initialUsers,
}: {
  initialUsers: UserRow[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(initialUsers[0]?.id ?? "");
  const [form, setForm] = useState<Form>(
    initialUsers[0] ? toForm(initialUsers[0]) : blankForm(),
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedUser = users.find((u) => u.id === selectedId);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").toLowerCase().includes(q)
    );
  });

  function selectUser(u: UserRow) {
    setSelectedId(u.id);
    setForm(toForm(u));
    setMessage("");
  }

  async function refresh(nextSelectedId?: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, phone, role, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setMessage(error.message);
      return;
    }
    const next = (data ?? []) as UserRow[];
    setUsers(next);
    const activeId = nextSelectedId || selectedId || next[0]?.id || "";
    const active = next.find((u) => u.id === activeId);
    setSelectedId(active?.id ?? "");
    setForm(active ? toForm(active) : blankForm());
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null,
        role: form.role,
      })
      .eq("id", selectedUser.id);
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("User updated.");
    await refresh(selectedUser.id);
  }

  async function deleteUser() {
    if (!selectedUser) return;
    const ok = window.confirm(
      `Delete profile for ${selectedUser.email || "this user"}? This cannot be undone.`,
    );
    if (!ok) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", selectedUser.id);
    setSaving(false);
    if (error) {
      setMessage(
        error.message.includes("orders")
          ? "Cannot delete: this user has existing orders. Demote them to customer instead."
          : error.message,
      );
      return;
    }
    setMessage("User deleted.");
    await refresh();
  }

  return (
    <section className="adminSplit">
      <div>
        <input
          aria-label="Search users"
          className="adminInput"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone…"
          style={{ marginBottom: "0.6rem" }}
          type="search"
          value={search}
        />
        <div className="adminList">
          {filtered.length === 0 ? (
            <p className="adminEmpty">No users match.</p>
          ) : (
            filtered.map((u) => (
              <button
                className={`adminListItem${u.id === selectedId ? " adminListItemActive" : ""}`}
                key={u.id}
                onClick={() => selectUser(u)}
                type="button"
              >
                <span style={{ fontWeight: 500 }}>
                  {u.full_name || u.email || "—"}
                </span>
                <small>
                  {u.email} · {u.role} · {fmtDate(u.created_at)}
                </small>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="adminCard">
        {!selectedUser ? (
          <p className="adminEmpty">Select a user to edit.</p>
        ) : (
          <form className="adminForm" onSubmit={save}>
            <div className="adminPanelHead">
              <h2>{selectedUser.email}</h2>
              <span className="adminMuted" style={{ color: "var(--admin-muted)", fontSize: "0.78rem" }}>
                Joined {fmtDate(selectedUser.created_at)}
              </span>
            </div>

            <div className="adminFormGrid">
              <label className="adminFormRow">
                <span className="adminFormLabel">Full name</span>
                <input
                  className="adminInput"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  value={form.full_name}
                />
              </label>
              <label className="adminFormRow">
                <span className="adminFormLabel">Phone</span>
                <input
                  className="adminInput"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  value={form.phone}
                />
              </label>
            </div>

            <label className="adminFormRow">
              <span className="adminFormLabel">Role</span>
              <select
                className="adminSelect"
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                value={form.role}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {message && <div className="adminToast">{message}</div>}

            <div className="adminButtonRow">
              <button
                className="adminButton adminButtonDanger"
                disabled={saving}
                onClick={deleteUser}
                type="button"
              >
                Delete user
              </button>
              <button
                className="adminButton adminButtonPrimary"
                disabled={saving}
                type="submit"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
