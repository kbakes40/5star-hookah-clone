import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/lib/SupabaseAuthProvider";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product { id: string; name: string; brand?: string; category: string; price: number; sale_price?: number; stock: number; sku: string; image_url?: string; badge?: string; in_stock?: boolean; featured?: boolean; trending?: boolean; description?: string; created_at: string; }
interface Order { id: string; customer_name: string; customer_email: string; total: number; status: string; fulfillment_status: string; created_at: string; }
interface Customer { id: string; name: string; email: string; phone: string; total_spent: number; order_count: number; created_at: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-900/60 text-yellow-300",
    paid: "bg-[#1f2619] text-[#d7ff3f]",
    completed: "bg-[#1f2619] text-[#d7ff3f]",
    failed: "bg-red-900/60 text-red-300",
    refunded: "bg-orange-900/60 text-orange-300",
    cancelled: "bg-red-900/60 text-red-300",
    ready_to_ship: "bg-blue-900/60 text-blue-300",
    shipped: "bg-cyan-900/60 text-cyan-300",
    delivered: "bg-[#1f2619] text-[#d7ff3f]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status?.toLowerCase()] ?? "bg-zinc-800 text-zinc-400"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-zinc-950/70 p-4 border border-zinc-900/80">
      <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-[#d7ff3f] mt-1">{value}</p>
      {sub && <p className="text-[11px] mt-0.5 text-zinc-500">{sub}</p>}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-zinc-600">
      <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-xs text-zinc-600">{msg}</p>
    </div>
  );
}

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-[11px] text-zinc-600">Page {page} of {pages} &middot; {total} records</span>
      <div className="flex gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="px-3 py-1 text-xs rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-30 hover:border-[#d7ff3f] hover:text-[#d7ff3f] transition-colors">‹</button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={`px-3 py-1 text-xs rounded-lg border transition-colors ${p === page ? "bg-[#d7ff3f] text-zinc-900 border-[#d7ff3f] font-semibold" : "border-zinc-800 text-zinc-400 hover:border-[#d7ff3f] hover:text-[#d7ff3f]"}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === pages}
          className="px-3 py-1 text-xs rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-30 hover:border-[#d7ff3f] hover:text-[#d7ff3f] transition-colors">›</button>
      </div>
    </div>
  );
}

function SectionNav<T extends string>({ sections, active, onChange }: { sections: T[]; active: T; onChange: (s: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {sections.map(s => (
        <button key={s} onClick={() => onChange(s)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${active === s ? "bg-[#d7ff3f] text-zinc-900" : "bg-zinc-900 text-zinc-400 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] hover:text-zinc-200"}`}>
          {s}
        </button>
      ))}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.14em] text-zinc-600 bg-zinc-950/80 font-medium">{children}</th>;
}
function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <td className={`px-4 py-3 ${muted ? "text-zinc-500" : "text-zinc-200"}`}>{children}</td>;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type Section = "overview" | "orders" | "products" | "customers";

export default function AdminDashboard() {
  const { isAuthenticated, loading: authLoading, signOut, session } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  const [section, setSection] = useState<Section>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [prodPage, setProdPage] = useState(1);
  const [ordPage, setOrdPage] = useState(1);
  const [custPage, setCustPage] = useState(1);
  const PER = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setDataLoading(true);
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      "Content-Type": "application/json",
    };
    const base = import.meta.env.VITE_SUPABASE_URL as string;

    const [pRes, oRes, cRes] = await Promise.all([
      fetch(`${base}/rest/v1/bh_products?select=*&order=created_at.desc`, { headers }),
      fetch(`${base}/rest/v1/bh_orders?select=*&order=created_at.desc`, { headers }),
      fetch(`${base}/rest/v1/bh_customers?select=*&order=created_at.desc`, { headers }),
    ]);

    const [p, o, c] = await Promise.all([
      pRes.ok ? pRes.json() : [],
      oRes.ok ? oRes.json() : [],
      cRes.ok ? cRes.json() : [],
    ]);

    setProducts(p);
    setOrders(o);
    setCustomers(c);
    setDataLoading(false);
  }, [session]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#d7ff3f] flex items-center justify-center">
        <div className="rounded-[28px] bg-[#050505] px-8 py-6 text-zinc-400 text-sm">Loading…</div>
      </main>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const lowStock = products.filter(p => p.stock < 5).length;

  const prodSlice = products.slice((prodPage - 1) * PER, prodPage * PER);
  const ordSlice = orders.slice((ordPage - 1) * PER, ordPage * PER);
  const custSlice = customers.slice((custPage - 1) * PER, custPage * PER);

  const now = new Date();

  return (
    <main className="min-h-screen bg-[#d7ff3f] px-2 py-4 text-sm text-zinc-100 md:px-6">
      <div className="mx-auto flex max-w-6xl gap-4 rounded-[32px] bg-[#050505] p-3 md:p-5">

        {/* Left sidebar */}
        <aside className="flex w-12 flex-col items-center justify-between rounded-2xl bg-[#0b0b0b] py-4 md:w-14">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 rounded-2xl bg-[#d7ff3f]" />
            <div className="h-[1px] w-6 bg-zinc-700/60" />
            {(["overview", "orders", "products", "customers"] as Section[]).map((s, i) => (
              <button key={s} onClick={() => setSection(s)} title={s}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border text-[10px] transition-colors ${section === s ? "border-[#d7ff3f] bg-zinc-900/80 text-[#d7ff3f]" : "border-zinc-700/60 text-zinc-400 hover:border-[#d7ff3f] hover:text-[#d7ff3f]"}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => setLocation("/")} title="Back to store"
              className="h-8 w-8 rounded-full bg-zinc-900/80 border border-zinc-700/60 flex items-center justify-center text-zinc-500 hover:text-[#d7ff3f] hover:border-[#d7ff3f] transition-colors text-[10px]">
              ↗
            </button>
            <button onClick={() => signOut()} title="Sign out"
              className="h-7 w-7 rounded-full border border-zinc-600/70 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-400 transition-colors text-[10px]">
              ×
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Header */}
          <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Today, {now.toLocaleDateString("en-US", { day: "2-digit", month: "short" })}
              </p>
              <h1 className="text-xl font-semibold text-zinc-50 md:text-2xl">Boss Hookah</h1>
              <p className="mt-0.5 text-xs text-zinc-500">Admin Dashboard</p>
            </div>
            <SectionNav
              sections={["overview", "orders", "products", "customers"] as Section[]}
              active={section}
              onChange={setSection}
            />
          </header>

          {/* Content */}
          <div className="rounded-2xl bg-[#0b0b0b] p-4 md:p-5">
            {dataLoading ? (
              <div className="flex items-center justify-center h-48 text-zinc-600 text-xs">Loading data…</div>
            ) : (
              <>
                {/* OVERVIEW */}
                {section === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <StatCard label="Products" value={products.length} sub="in catalog" />
                      <StatCard label="Orders" value={orders.length} sub={`${pendingOrders} pending`} />
                      <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="all time" />
                      <StatCard label="Customers" value={customers.length} sub={`${lowStock} low stock`} />
                    </div>
                    <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/60 overflow-hidden">
                      <div className="px-4 py-3 border-b border-zinc-900/80 flex items-center justify-between">
                        <p className="text-xs font-medium text-zinc-300">Recent Orders</p>
                        <button onClick={() => setSection("orders")} className="text-[11px] text-[#d7ff3f] hover:underline">View all</button>
                      </div>
                      {orders.length === 0 ? <EmptyState msg="No orders yet." /> : (
                        <table className="w-full text-xs">
                          <thead><tr><Th>Customer</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th></tr></thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {orders.slice(0, 6).map(o => (
                              <tr key={o.id} className="hover:bg-zinc-900/30 transition-colors">
                                <Td>{o.customer_name || "—"}</Td>
                                <Td>${(o.total || 0).toFixed(2)}</Td>
                                <Td><StatusBadge status={o.status} /></Td>
                                <Td muted>{new Date(o.created_at).toLocaleDateString()}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { label: "Manage Orders", sub: "Update fulfillment status", s: "orders" as Section },
                        { label: "View Customers", sub: "Browse customer list", s: "customers" as Section },
                        { label: "Manage Inventory", sub: "Update stock levels", s: "products" as Section },
                      ].map(item => (
                        <button key={item.s} onClick={() => setSection(item.s)}
                          className="rounded-2xl border border-zinc-900/80 bg-zinc-950/60 p-4 text-left hover:border-[#d7ff3f]/40 transition-colors">
                          <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                          <p className="text-[11px] text-zinc-600 mt-0.5">{item.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ORDERS */}
                {section === "orders" && (
                  <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/60 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-900/80">
                      <p className="text-xs font-medium text-zinc-300">All Orders <span className="text-zinc-600">({orders.length})</span></p>
                    </div>
                    {orders.length === 0 ? <EmptyState msg="No orders yet." /> : (
                      <>
                        <table className="w-full text-xs">
                          <thead><tr><Th>Customer</Th><Th>Email</Th><Th>Total</Th><Th>Status</Th><Th>Fulfillment</Th><Th>Date</Th></tr></thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {ordSlice.map(o => (
                              <tr key={o.id} className="hover:bg-zinc-900/30 transition-colors">
                                <Td>{o.customer_name || "—"}</Td>
                                <Td muted>{o.customer_email || "—"}</Td>
                                <Td>${(o.total || 0).toFixed(2)}</Td>
                                <Td><StatusBadge status={o.status} /></Td>
                                <Td><StatusBadge status={o.fulfillment_status || "pending"} /></Td>
                                <Td muted>{new Date(o.created_at).toLocaleDateString()}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="px-4 pb-4"><Pagination page={ordPage} total={orders.length} perPage={PER} onChange={setOrdPage} /></div>
                      </>
                    )}
                  </div>
                )}

                {/* PRODUCTS */}
                {section === "products" && (
                  <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/60 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-900/80">
                      <p className="text-xs font-medium text-zinc-300">Products <span className="text-zinc-600">({products.length})</span></p>
                    </div>
                    {products.length === 0 ? <EmptyState msg="No products yet." /> : (
                      <>
                        <table className="w-full text-xs">
                          <thead><tr><Th>Product</Th><Th>Brand</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th>SKU</Th></tr></thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {prodSlice.map(p => (
                              <tr key={p.id} className="hover:bg-zinc-900/30 transition-colors">
                                <Td>
                                  <div className="flex items-center gap-2">
                                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-zinc-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                                    <div>
                                      <p className="text-zinc-200 font-medium">{p.name}</p>
                                      {p.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1f2619] text-[#d7ff3f] font-semibold">{p.badge}</span>}
                                    </div>
                                  </div>
                                </Td>
                                <Td muted>{p.brand || "—"}</Td>
                                <Td muted>{p.category || "—"}</Td>
                                <Td>
                                  <span className="text-zinc-200">${(p.price || 0).toFixed(2)}</span>
                                  {p.sale_price && <span className="ml-1 text-[10px] text-[#d7ff3f]">→ ${p.sale_price.toFixed(2)}</span>}
                                </Td>
                                <Td><span className={p.stock < 5 ? "text-red-400 font-medium" : "text-zinc-200"}>{p.stock}</span></Td>
                                <Td>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.in_stock !== false ? 'bg-[#1f2619] text-[#d7ff3f]' : 'bg-red-900/60 text-red-300'}`}>
                                    {p.in_stock !== false ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </Td>
                                <Td muted>{p.sku || "—"}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="px-4 pb-4"><Pagination page={prodPage} total={products.length} perPage={PER} onChange={setProdPage} /></div>
                      </>
                    )}
                  </div>
                )}

                {/* CUSTOMERS */}
                {section === "customers" && (
                  <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/60 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-900/80">
                      <p className="text-xs font-medium text-zinc-300">Customers <span className="text-zinc-600">({customers.length})</span></p>
                    </div>
                    {customers.length === 0 ? <EmptyState msg="No customers yet." /> : (
                      <>
                        <table className="w-full text-xs">
                          <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>Orders</Th><Th>Total Spent</Th></tr></thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {custSlice.map(c => (
                              <tr key={c.id} className="hover:bg-zinc-900/30 transition-colors">
                                <Td>{c.name || "—"}</Td>
                                <Td muted>{c.email || "—"}</Td>
                                <Td muted>{c.phone || "—"}</Td>
                                <Td>{c.order_count}</Td>
                                <Td>${(c.total_spent || 0).toFixed(2)}</Td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="px-4 pb-4"><Pagination page={custPage} total={customers.length} perPage={PER} onChange={setCustPage} /></div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-center text-[10px] text-zinc-700">
            Boss Hookah Admin · Supabase Auth · {now.getFullYear()}
          </p>
        </div>
      </div>
    </main>
  );
}
