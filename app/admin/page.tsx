import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

const ORDER_STATUS_BADGE: Record<string, string> = {
  pending_payment: "adminBadgeWarn",
  paid: "adminBadgeOk",
  fulfilled: "adminBadgeOk",
  cancelled: "adminBadgeAlert",
  refunded: "adminBadgeAlert",
};

function fmtDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-EG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminPage() {
  const supabase = createClient();

  const [
    productsRes,
    scentsRes,
    ordersRes,
    usersRes,
    promoRes,
    revenueRes,
    recentOrdersRes,
    recentUsersRes,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("scents").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("promo_codes")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("total_cents, currency, status")
      .in("status", ["paid", "fulfilled"]),
    supabase
      .from("orders")
      .select("id, status, total_cents, currency, customer_name, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const productsCount = productsRes.count ?? 0;
  const scentsCount = scentsRes.count ?? 0;
  const ordersCount = ordersRes.count ?? 0;
  const usersCount = usersRes.count ?? 0;
  const promoCount = promoRes.count ?? 0;
  const revenueRows = (revenueRes.data ?? []) as Array<{
    total_cents: number;
    currency: string;
  }>;
  const revenueCents = revenueRows.reduce((sum, row) => sum + (row.total_cents ?? 0), 0);
  const revenueCurrency = revenueRows[0]?.currency ?? "EGP";

  const recentOrders = (recentOrdersRes.data ?? []) as Array<{
    id: string;
    status: string;
    total_cents: number;
    currency: string;
    customer_name: string | null;
    created_at: string;
  }>;
  const recentUsers = (recentUsersRes.data ?? []) as Array<{
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
    created_at: string;
  }>;

  return (
    <>
      <header className="adminPageHead">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Studio overview.</h1>
          <p>A snapshot of the cabinet, the orders that came in, and who&rsquo;s using the storefront.</p>
        </div>
        <div className="adminButtonRow">
          <Link className="adminButton" href="/admin/products">+ New product</Link>
          <Link className="adminButton adminButtonPrimary" href="/admin/orders">
            View orders
          </Link>
        </div>
      </header>

      <section aria-label="Key metrics" className="adminStatGrid">
        <Stat label="Revenue" value={formatPrice(revenueCents, revenueCurrency)} hint="Paid + fulfilled orders" />
        <Stat label="Orders" value={String(ordersCount)} hint="All time" />
        <Stat label="Products" value={String(productsCount)} hint={`${scentsCount} scents available`} />
        <Stat label="Customers" value={String(usersCount)} hint={`${promoCount} active promo${promoCount === 1 ? "" : "s"}`} />
      </section>

      <section className="adminPanelGrid">
        <div className="adminCard">
          <div className="adminPanelHead">
            <h2>Recent orders</h2>
            <Link href="/admin/orders">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="adminEmpty">No orders yet.</p>
          ) : (
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id}`}>
                        {order.customer_name || "—"}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`adminBadge ${ORDER_STATUS_BADGE[order.status] ?? "adminBadgeNeutral"}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="adminMuted">{fmtDate(order.created_at)}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatPrice(order.total_cents, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="adminCard">
          <div className="adminPanelHead">
            <h2>New customers</h2>
            <Link href="/admin/users">Manage →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="adminEmpty">No customers yet.</p>
          ) : (
            <ul style={{ display: "grid", gap: "0.65rem", margin: 0, padding: 0, listStyle: "none" }}>
              {recentUsers.map((u) => (
                <li
                  key={u.id}
                  style={{
                    alignItems: "center",
                    borderBottom: "1px solid var(--admin-line-soft)",
                    display: "flex",
                    gap: "0.7rem",
                    paddingBottom: "0.65rem",
                  }}
                >
                  <span className="adminProfileAvatar" aria-hidden>
                    {(u.full_name || u.email || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span style={{ display: "grid", flex: 1, lineHeight: 1.2, minWidth: 0 }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                      {u.full_name || u.email || "—"}
                    </span>
                    <span style={{ color: "var(--admin-muted)", fontSize: "0.72rem" }}>
                      {fmtDate(u.created_at)}
                    </span>
                  </span>
                  <span
                    className={`adminBadge ${u.role === "admin" ? "adminBadgeOk" : "adminBadgeMuted"}`}
                  >
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="adminStatCard">
      <span className="adminStatLabel">{label}</span>
      <span className="adminStatValue">{value}</span>
      {hint ? <span className="adminStatHint">{hint}</span> : null}
    </article>
  );
}
