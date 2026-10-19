"use client";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { API_ENDPOINTS, apiClient } from "../../lib/api/client";
import type {
  Account,
  Balance,
  Entry,
  Instructor,
  Overview,
  Page,
  Payout,
  Settings,
} from "./finance.types";

const currency = (value: unknown) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
const date = (value?: string) =>
  value ? new Date(value).toLocaleString("en-BD", { timeZone: "Asia/Dhaka" }) : "—";
const field =
  "w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100 focus:border-orange-400 focus:outline-none";
const button =
  "rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-40";
const zero: Balance = {
  totalEarnings: "0",
  netEarnings: "0",
  pendingBalance: "0",
  availableBalance: "0",
  requestedProcessing: "0",
  totalPaid: "0",
  refundedAdjusted: "0",
  minimumPayout: "0",
};
function Label({ title, children }: { title: string; children: ReactNode }) {
  return (
    <label className='block space-y-2 text-sm text-slate-300'>
      <span>{title}</span>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
            "aria-label": title,
          })
        : children}
    </label>
  );
}
function Cards({ items }: { items: [string, unknown][] }) {
  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {items.map(([title, value]) => (
        <div
          key={title}
          className='rounded border border-slate-700 bg-slate-900 p-5'
        >
          <p className='text-sm text-slate-400'>{title}</p>
          <p className='mt-3 wrap-break-word text-2xl font-semibold text-white'>{currency(value)}</p>
        </div>
      ))}
    </div>
  );
}
function Status({ value }: { value: string }) {
  return (
    <span className='inline-block rounded-full border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200'>
      {value.replaceAll("_", " ")}
    </span>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <p className='rounded border border-dashed border-slate-700 p-8 text-center text-slate-400'>
      {children}
    </p>
  );
}

export default function FinanceWorkspace({
  admin = false,
  initialTab = "overview",
}: {
  admin?: boolean;
  initialTab?: string;
}) {
  const [tab, setTab] = useState(initialTab),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [balance, setBalance] = useState<Balance>(zero),
    [overview, setOverview] = useState<Overview | null>(null),
    [settings, setSettings] = useState<Settings | null>(null);
  const [entries, setEntries] = useState<Page<Entry>>({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 20,
    }),
    [payouts, setPayouts] = useState<Page<Payout>>({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 20,
    }),
    [instructors, setInstructors] = useState<Page<Instructor>>({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 20,
    }),
    [accounts, setAccounts] = useState<Account[]>([]);
  const [currentPage, setPage] = useState(1),
    [statusFilter, setStatusFilter] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [periodKey, setPeriodKey] = useState("");
  const [detail, setDetail] = useState<Payout | null>(null),
    [refundEntry, setRefundEntry] = useState<Entry | null>(null),
    [note, setNote] = useState(""),
    [reference, setReference] = useState("");
  const [payoutAmount, setPayoutAmount] = useState(""),
    [methodId, setMethodId] = useState("");
  const requestKey = useRef("");
  const [account, setAccount] = useState({
    id: "",
    method: "BKASH",
    accHolderName: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    routingNumber: "",
  });
  const [override, setOverride] = useState<Instructor | null>(null),
    [bookRate, setBookRate] = useState(""),
    [courseRate, setCourseRate] = useState("");
  const loadSequence = useRef(0);
  const root = admin ? API_ENDPOINTS.FINANCE.ADMIN : API_ENDPOINTS.FINANCE.INSTRUCTOR;
  const load = useCallback(async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    setError("");
    try {
      const get = async <T,>(path: string): Promise<T> => {
        const r = await apiClient.get<T>(path);
        if (sequence !== loadSequence.current) throw new Error("Superseded finance request.");
        if (!r.success || !r.data) throw new Error(r.message ?? "Unable to load finance data.");
        return r.data;
      };
      if (admin) {
        if (tab === "overview") setOverview(await get<Overview>(`${root}/overview${periodKey}`));
        if (tab === "transactions")
          setEntries(await get<Page<Entry>>(`${root}/transactions?page=${currentPage}`));
        if (tab === "instructors")
          setInstructors(await get<Page<Instructor>>(`${root}/instructors?page=${currentPage}`));
        if (tab === "payouts" || tab === "history")
          setPayouts(
            await get<Page<Payout>>(
              `${root}/payouts?page=${currentPage}${tab === "history" ? "&status=PAID" : statusFilter ? `&status=${statusFilter}` : ""}`
            )
          );
        if (tab === "settings") setSettings(await get<Settings>(`${root}/settings`));
      } else {
        setBalance(await get<Balance>(`${root}/overview`));
        if (tab === "transactions" || tab === "overview")
          setEntries(await get<Page<Entry>>(`${root}/transactions?page=${currentPage}`));
        if (tab === "payouts") {
          setPayouts(await get<Page<Payout>>(`${root}/payouts?page=${currentPage}`));
          setAccounts(await get<Account[]>(`${root}/accounts`));
        }
        if (tab === "accounts") setAccounts(await get<Account[]>(`${root}/accounts`));
      }
    } catch (e) {
      if (sequence === loadSequence.current)
        setError(e instanceof Error ? e.message : "Unable to load finance data.");
    } finally {
      if (sequence === loadSequence.current) setLoading(false);
    }
  }, [root, tab, currentPage, statusFilter, admin, periodKey]);
  useEffect(() => {
    void load();
    return () => {
      loadSequence.current++;
    };
  }, [load]);
  useEffect(() => {
    if (!detail && !refundEntry && !override) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [detail, refundEntry, override]);
  async function mutate(path: string, body: unknown, method: "post" | "patch" = "post") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await apiClient[method](path, body);
      if (!r.success) throw new Error(r.message ?? "Operation failed.");
      setNotice("Saved successfully.");
      await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function openPayout(id: string) {
    setBusy(true);
    setError("");
    try {
      const r = await apiClient.get<Payout>(`${root}/payouts/${id}`);
      if (!r.success || !r.data) throw new Error(r.message ?? "Unable to load payout.");
      setDetail(r.data);
      setNote("");
      setReference("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load payout.");
    } finally {
      setBusy(false);
    }
  }
  const tabs = admin
    ? [
        ["overview", "Overview"],
        ["transactions", "Transactions"],
        ["instructors", "Instructor earnings"],
        ["payouts", "Payout requests"],
        ["history", "Payout history"],
        ["settings", "Commission settings"],
      ]
    : [
        ["overview", "Earnings"],
        ["transactions", "Transactions"],
        ["payouts", "Payouts"],
        ["accounts", "Payout accounts"],
      ];
  function changeTab(next: string) {
    setTab(next);
    setPage(1);
    setError("");
    setNotice("");
  }
  const overviewItems: [string, unknown][] = overview
    ? [
        ["Gross product sales", overview.grossSales],
        ["Book sales", overview.bookSales],
        ["Course sales", overview.courseSales],
        ["Commission revenue", overview.commissionRevenue],
        ["Course platform fees", overview.platformFeeRevenue],
        ["Gross platform revenue", overview.grossPlatformRevenue],
        ["Refunded product sales", overview.refundAmount],
        ["Refund revenue impact", overview.refundRevenueImpact],
        ["Known gateway costs", overview.knownGatewayCosts],
        ["Net revenue before unknown costs", overview.netPlatformRevenueBeforeUnknownCosts],
        ["Instructor earnings in period", overview.periodInstructorEarnings],
      ]
    : [];
  const balances = admin ? (overview?.balances ?? zero) : balance;
  function balanceCards() {
    return (
      <Cards
        items={[
          ["Total instructor earnings", balances.totalEarnings],
          ["Pending balance", balances.pendingBalance],
          ["Available balance", balances.availableBalance],
          ["Requested / processing", balances.requestedProcessing],
          ["Total paid", balances.totalPaid],
          ["Refunds / adjustments", balances.refundedAdjusted],
        ]}
      />
    );
  }
  const listed =
    tab === "transactions" || (!admin && tab === "overview")
      ? entries
      : tab === "instructors"
        ? instructors
        : payouts;
  function pagination() {
    return (
      <div className='flex items-center justify-between gap-3 text-sm text-slate-400'>
        <span>
          {listed.total} records · Page {currentPage}
        </span>
        <div className='flex gap-2'>
          <button
            className={button}
            disabled={loading || currentPage === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <button
            className={button}
            disabled={loading || currentPage * 20 >= listed.total}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
  function transactionTable() {
    return (
      <>
        <div className='overflow-x-auto rounded border border-slate-700'>
          <table className='w-full min-w-[1000px] text-left text-sm'>
            <thead className='bg-slate-800 text-slate-300'>
              <tr>
                {[
                  "Date / product",
                  "Sale / discount",
                  "Commission",
                  "Platform fee",
                  "Instructor earning",
                  "Platform revenue",
                  "Status / available date",
                  ...(admin ? ["Action"] : []),
                ].map(h => (
                  <th
                    key={h}
                    className='p-3'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.rows.map(e => (
                <tr
                  key={e.id}
                  className='border-t border-slate-800'
                >
                  <td className='max-w-56 p-3'>
                    <p className='font-semibold text-white'>{e.productTitle}</p>
                    <p className='text-xs text-slate-400'>
                      {e.productType} · {e.kind} · {date(e.createdAt)}
                    </p>
                    <span className='text-xs text-slate-500'>Order {e.orderId.slice(0, 8)}</span>
                  </td>
                  <td className='p-3'>
                    {currency(e.netSaleAmount)}
                    <p className='text-xs text-slate-400'>
                      Allocated discount {currency(e.discountAmount)}
                    </p>
                  </td>
                  <td className='p-3'>
                    {currency(e.commissionAmount)}
                    <p className='text-xs text-slate-400'>
                      {e.commissionRate}% · {e.commissionSource}
                    </p>
                  </td>
                  <td className='p-3'>
                    {currency(e.platformFeeAmount)}
                    <p className='text-xs text-slate-400'>
                      {e.platformFeeType} {e.platformFeeValue}
                    </p>
                  </td>
                  <td className='p-3'>{currency(e.instructorEarning)}</td>
                  <td className='p-3'>{currency(e.platformRevenue)}</td>
                  <td className='p-3'>
                    <Status value={e.displayStatus} />
                    <p className='mt-1 text-xs text-slate-400'>{date(e.availableAt)}</p>
                    {e.refundReference && (
                      <p className='text-xs'>Refund ref: {e.refundReference}</p>
                    )}
                  </td>
                  {admin && (
                    <td className='p-3'>
                      {e.kind === "SALE" && !e.reversal && (
                        <button
                          disabled={busy}
                          className={button}
                          onClick={() => {
                            setRefundEntry(e);
                            setReference("");
                            setNote("");
                          }}
                        >
                          Record refund
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!entries.rows.length && <Empty>No financial transactions yet.</Empty>}
        {pagination()}
      </>
    );
  }
  async function payoutSubmit(e: FormEvent) {
    e.preventDefault();
    if (!requestKey.current) requestKey.current = crypto.randomUUID();
    if (
      await mutate(`${root}/payouts`, {
        amount: payoutAmount,
        methodId,
        requestKey: requestKey.current,
      })
    ) {
      requestKey.current = "";
      setPayoutAmount("");
    }
  }
  return (
    <section className='min-w-0 space-y-6 text-slate-100'>
      <header className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold'>{admin ? "Finance" : "Earnings & payouts"}</h1>
          <p className='mt-2 text-sm text-slate-400'>
            {admin
              ? "Verified sales, platform revenue and instructor settlements."
              : "Your sale earnings, held funds and manual payout history."}
          </p>
        </div>
        <button
          className={button}
          disabled={loading || busy}
          onClick={() => void load()}
        >
          Refresh
        </button>
      </header>
      <nav
        className='flex flex-wrap gap-2'
        aria-label='Finance sections'
      >
        {tabs.map(([id, label]) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => changeTab(id as string)}
            className={`rounded px-4 py-2 text-sm ${tab === id ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <p
          role='alert'
          className='rounded border border-red-700 bg-red-950/30 p-4 text-red-300'
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role='status'
          className='text-emerald-400'
        >
          {notice}
        </p>
      )}
      {loading && (
        <p
          role='status'
          className='text-slate-400'
        >
          Loading financial records…
        </p>
      )}
      {tab === "overview" && (
        <>
          {admin && (
            <form
              onSubmit={e => {
                e.preventDefault();
                setPeriodKey(
                  from && to
                    ? `?from=${encodeURIComponent(from + "T00:00:00+06:00")}&to=${encodeURIComponent(to + "T23:59:59.999+06:00")}`
                    : ""
                );
              }}
              className='flex flex-wrap items-end gap-3'
            >
              <Label title='From'>
                <input
                  type='date'
                  className={field}
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  required
                />
              </Label>
              <Label title='To'>
                <input
                  type='date'
                  className={field}
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  required
                />
              </Label>
              <button className={button}>Apply period</button>
            </form>
          )}
          {admin && (
            <>
              <Cards items={overviewItems} />
              <p className='text-sm text-slate-400'>
                Product sales exclude shipping. Platform fees reduce instructor earnings; the
                customer checkout amount stays the same. Gateway costs show only amounts returned by
                a provider.
              </p>
              <h2 className='text-xl font-semibold'>
                Current instructor liabilities · all periods
              </h2>
            </>
          )}
          {balanceCards()}
          {admin && overview && (
            <>
              <div className='overflow-x-auto rounded border border-slate-700 p-4'>
                <h2 className='mb-3 font-semibold'>
                  Daily sales and platform revenue · selected period
                </h2>
                <table className='w-full text-sm'>
                  <thead>
                    <tr>
                      <th className='p-2 text-left'>Date</th>
                      <th className='p-2 text-right'>Net product sales</th>
                      <th className='p-2 text-right'>Platform revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.trend.map(t => (
                      <tr
                        className='border-t border-slate-800'
                        key={t.day}
                      >
                        <td className='p-2'>{t.day}</td>
                        <td className='p-2 text-right'>{currency(t.grossSales)}</td>
                        <td className='p-2 text-right'>{currency(t.platformRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!overview.trend.length && <Empty>No sales in this period.</Empty>}
              </div>
              {overview.legacyPaidPayouts.count > 0 && (
                <p className='text-sm text-amber-300'>
                  Legacy paid payouts: {currency(overview.legacyPaidPayouts.amount)}. These have no
                  ledger allocations and are excluded from new balances. Reconcile legacy funds
                  separately before launch.
                </p>
              )}
            </>
          )}
          {!admin && (
            <>
              <h2 className='text-xl font-semibold'>Sale and adjustment history</h2>
              {transactionTable()}
            </>
          )}
        </>
      )}
      {tab === "transactions" && transactionTable()}
      {(tab === "payouts" || tab === "history") && (
        <>
          {!admin && (
            <>
              <Cards
                items={[
                  ["Available balance", balance.availableBalance],
                  ["Minimum payout", balance.minimumPayout],
                  ["Reserved payouts", balance.requestedProcessing],
                  ["Total paid", balance.totalPaid],
                ]}
              />
              <form
                className='grid gap-4 rounded border border-slate-700 bg-slate-900 p-5 md:grid-cols-3'
                onSubmit={payoutSubmit}
              >
                <Label title='Amount (BDT)'>
                  <input
                    required
                    inputMode='decimal'
                    type='number'
                    min='0.01'
                    step='0.01'
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                    className={field}
                  />
                </Label>
                <Label title='Payout account'>
                  <select
                    required
                    className={field}
                    value={methodId}
                    onChange={e => setMethodId(e.target.value)}
                  >
                    <option value=''>Select account</option>
                    {accounts.map(a => (
                      <option
                        key={a.id}
                        value={a.id}
                      >
                        {a.mobileBankingName ?? a.bankName ?? a.type} · ••••
                        {a.accountLastFour}
                      </option>
                    ))}
                  </select>
                </Label>
                <div className='self-end'>
                  <button
                    disabled={busy || loading || !accounts.length}
                    className={button}
                  >
                    Request payout
                  </button>
                  <p className='mt-2 text-xs text-slate-400'>
                    Balance and eligibility are verified by the backend.
                  </p>
                </div>
                {!accounts.length && (
                  <button
                    type='button'
                    className='text-orange-400'
                    onClick={() => changeTab("accounts")}
                  >
                    Add a payout account first →
                  </button>
                )}
              </form>
            </>
          )}
          {admin && tab === "payouts" && (
            <Label title='Status'>
              <select
                className={field}
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value=''>All statuses</option>
                {["REQUESTED", "APPROVED", "PROCESSING", "PAID", "REJECTED", "CANCELLED"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Label>
          )}
          <div className='overflow-x-auto rounded border border-slate-700'>
            <table className='w-full min-w-[720px] text-left text-sm'>
              <thead className='bg-slate-800'>
                <tr>
                  {[
                    "Requested",
                    ...(admin ? ["Instructor"] : []),
                    "Amount",
                    "Method",
                    "Status",
                    "Reference / reason",
                    "Details",
                  ].map(h => (
                    <th
                      className='p-3'
                      key={h}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.rows.map(p => (
                  <tr
                    key={p.id}
                    className='border-t border-slate-800'
                  >
                    <td className='p-3'>{date(p.requestedAt)}</td>
                    {admin && (
                      <td className='p-3'>
                        {p.instructor?.instructorProfile?.displayName}
                        <p className='text-xs text-slate-400'>{p.instructor?.email}</p>
                      </td>
                    )}
                    <td className='p-3'>{currency(p.amount)}</td>
                    <td className='p-3'>
                      {p.methodType} · ••••{p.accountLastFour}
                    </td>
                    <td className='p-3'>
                      <Status value={p.workflowStatus} />
                    </td>
                    <td className='max-w-64 break-words p-3'>
                      {p.transactionReference ?? p.rejectionReason ?? p.adminNote ?? "—"}
                    </td>
                    <td className='p-3'>
                      <button
                        disabled={busy}
                        className={button}
                        onClick={() => void openPayout(p.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!payouts.rows.length && <Empty>No payout history yet.</Empty>}
          {pagination()}
        </>
      )}
      {tab === "accounts" && !admin && (
        <>
          <form
            className='grid gap-4 rounded border border-slate-700 bg-slate-900 p-5 sm:grid-cols-2'
            onSubmit={async e => {
              e.preventDefault();
              if (
                await mutate(`${root}/accounts`, {
                  ...account,
                  id: account.id || undefined,
                })
              )
                setAccount({ ...account, id: "", accountNumber: "" });
            }}
          >
            <h2 className='sm:col-span-2 text-lg font-semibold'>
              {account.id ? "Update payout account" : "Add payout account"}
            </h2>
            <Label title='Method'>
              <select
                className={field}
                value={account.method}
                onChange={e => setAccount({ ...account, method: e.target.value })}
              >
                {["BKASH", "NAGAD", "BANK_TRANSFER"].map(m => (
                  <option
                    key={m}
                    value={m}
                  >
                    {m.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </Label>
            <Label title='Account holder name'>
              <input
                required
                maxLength={120}
                className={field}
                value={account.accHolderName}
                onChange={e => setAccount({ ...account, accHolderName: e.target.value })}
              />
            </Label>
            <Label title='Account number'>
              <input
                required
                inputMode='numeric'
                autoComplete='off'
                pattern='[0-9]{6,34}'
                className={field}
                value={account.accountNumber}
                onChange={e => setAccount({ ...account, accountNumber: e.target.value })}
              />
            </Label>
            {account.method === "BANK_TRANSFER" &&
              (["bankName", "branchName", "routingNumber"] as const).map(k => (
                <Label
                  key={k}
                  title={
                    k === "bankName"
                      ? "Bank name"
                      : k === "branchName"
                        ? "Branch"
                        : "Routing number"
                  }
                >
                  <input
                    required={k === "bankName"}
                    className={field}
                    value={account[k]}
                    onChange={e => setAccount({ ...account, [k]: e.target.value })}
                  />
                </Label>
              ))}
            <div className='sm:col-span-2'>
              <button
                disabled={busy}
                className={button}
              >
                Save account
              </button>
              <p className='mt-2 text-xs text-slate-400'>
                Account numbers are encrypted and displayed using only the last four digits.
              </p>
            </div>
          </form>
          <div className='grid gap-3 sm:grid-cols-2'>
            {accounts.map(a => (
              <div
                key={a.id}
                className='rounded border border-slate-700 p-4'
              >
                <h3 className='font-semibold'>{a.mobileBankingName ?? a.bankName}</h3>
                <p className='text-slate-400'>
                  {a.accHolderName} · ••••{a.accountLastFour}
                </p>
                <button
                  className='mt-3 text-sm text-orange-400'
                  onClick={() =>
                    setAccount({
                      id: a.id,
                      method: a.mobileBankingName ?? "BANK_TRANSFER",
                      accHolderName: a.accHolderName,
                      accountNumber: "",
                      bankName: a.bankName ?? "",
                      branchName: a.branchName ?? "",
                      routingNumber: a.routingNumber ?? "",
                    })
                  }
                >
                  Update account
                </button>
              </div>
            ))}
          </div>
          {!accounts.length && <Empty>No payout accounts saved.</Empty>}
        </>
      )}
      {tab === "settings" && admin && settings && (
        <form
          className='grid gap-4 rounded border border-slate-700 bg-slate-900 p-5 sm:grid-cols-2'
          onSubmit={async e => {
            e.preventDefault();
            await mutate(`${root}/settings`, settings, "patch");
          }}
        >
          <h2 className='text-xl font-semibold sm:col-span-2'>Financial settings</h2>
          {(["globalBookCommission", "globalCourseCommission"] as const).map(k => (
            <Label
              key={k}
              title={
                k === "globalBookCommission"
                  ? "Global book commission (%)"
                  : "Global course commission (%)"
              }
            >
              <input
                type='number'
                required
                min='0'
                max='100'
                step='0.01'
                className={field}
                value={settings[k]}
                onChange={e => setSettings({ ...settings, [k]: e.target.value })}
              />
            </Label>
          ))}
          <Label title='Course platform fee type'>
            <select
              className={field}
              value={settings.coursePlatformFeeType}
              onChange={e =>
                setSettings({
                  ...settings,
                  coursePlatformFeeType: e.target.value as Settings["coursePlatformFeeType"],
                })
              }
            >
              {["NONE", "FIXED", "PERCENTAGE"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Label>
          <Label
            title={
              settings.coursePlatformFeeType === "PERCENTAGE"
                ? "Platform fee (%)"
                : "Platform fee (BDT)"
            }
          >
            <input
              type='number'
              required
              min='0'
              max={settings.coursePlatformFeeType === "PERCENTAGE" ? 100 : undefined}
              step='0.01'
              className={field}
              value={settings.coursePlatformFeeValue}
              onChange={e =>
                setSettings({
                  ...settings,
                  coursePlatformFeeValue: e.target.value,
                })
              }
            />
          </Label>
          <Label title='Holding period (days)'>
            <input
              type='number'
              required
              min='0'
              max='3650'
              step='1'
              className={field}
              value={settings.holdingPeriodDays}
              onChange={e =>
                setSettings({
                  ...settings,
                  holdingPeriodDays: Number(e.target.value),
                })
              }
            />
          </Label>
          <Label title='Minimum payout (BDT)'>
            <input
              type='number'
              required
              min='0'
              step='0.01'
              className={field}
              value={settings.minimumPayout}
              onChange={e => setSettings({ ...settings, minimumPayout: e.target.value })}
            />
          </Label>
          <p className='text-sm text-slate-400 sm:col-span-2'>
            Priority: product → instructor → global. Approval saves a product rate; update that rate
            for future sales using the product commission control. Fees are capped at the remaining
            sale value. Saved transactions and release dates stay unchanged.
          </p>
          <button
            disabled={busy}
            className={button}
          >
            Save settings
          </button>
          <ProductCommission
            root={root}
            onSave={mutate}
          />
        </form>
      )}
      {tab === "instructors" && admin && (
        <>
          <div className='overflow-x-auto rounded border border-slate-700'>
            <table className='w-full min-w-[850px] text-left text-sm'>
              <thead className='bg-slate-800'>
                <tr>
                  {[
                    "Instructor",
                    "Book / course override",
                    "Pending",
                    "Available",
                    "Reserved",
                    "Paid",
                    "Actions",
                  ].map(h => (
                    <th
                      className='p-3'
                      key={h}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {instructors.rows.map(i => (
                  <tr
                    key={i.id}
                    className='border-t border-slate-800'
                  >
                    <td className='p-3'>{i.displayName}</td>
                    <td className='p-3'>
                      {i.bookCommissionRate ?? "Global"} / {i.courseCommissionRate ?? "Global"}
                    </td>
                    <td className='p-3'>{currency(i.balances.pendingBalance)}</td>
                    <td className='p-3'>{currency(i.balances.availableBalance)}</td>
                    <td className='p-3'>{currency(i.balances.requestedProcessing)}</td>
                    <td className='p-3'>{currency(i.balances.totalPaid)}</td>
                    <td className='p-3'>
                      <button
                        className={button}
                        onClick={() => {
                          setOverride(i);
                          setBookRate(i.bookCommissionRate ?? "");
                          setCourseRate(i.courseCommissionRate ?? "");
                        }}
                      >
                        Edit override
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!instructors.rows.length && <Empty>No approved instructors.</Empty>}
          {pagination()}
        </>
      )}
      {(detail || refundEntry || override) && (
        <div
          role='dialog'
          aria-modal='true'
          aria-label={
            detail
              ? "Payout details"
              : refundEntry
                ? "Record refund"
                : "Instructor commission override"
          }
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'
        >
          <div className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded border border-slate-700 bg-slate-900 p-5'>
            <button
              type='button'
              className='float-right text-slate-300'
              aria-label='Close dialog'
              onClick={() => {
                setDetail(null);
                setRefundEntry(null);
                setOverride(null);
              }}
            >
              ✕
            </button>
            {detail && (
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold'>Payout {currency(detail.amount)}</h2>
                <Status value={detail.workflowStatus} />
                <p>
                  {detail.instructor?.instructorProfile?.displayName} · {detail.methodType} · ••••
                  {detail.accountLastFour}
                </p>
                <p className='text-sm text-slate-400'>
                  Requested {date(detail.requestedAt)} · Paid {date(detail.paidAt)}
                </p>
                {detail.transactionReference && (
                  <p>Transfer reference: {detail.transactionReference}</p>
                )}
                {detail.rejectionReason && <p>Rejection reason: {detail.rejectionReason}</p>}
                {admin && detail.account && (
                  <div className='rounded border border-slate-700 p-3'>
                    <h3 className='font-semibold'>Transfer destination</h3>
                    <p>
                      {detail.account.holder} · {detail.account.accountNumber}
                    </p>
                    <p>
                      {detail.account.bank} · {detail.account.branch} · {detail.account.routing}
                    </p>
                  </div>
                )}
                <h3 className='font-semibold'>Included earnings and refund offsets</h3>
                <div className='space-y-2'>
                  {detail.items?.map(i => (
                    <div
                      key={i.id}
                      className='flex justify-between gap-3 rounded bg-slate-800 p-3 text-sm'
                    >
                      <span>
                        {i.earning.productTitle} · {i.earning.kind}
                        <br />
                        <span className='text-xs text-slate-400'>
                          Order {i.earning.orderId} · Entry {i.earning.id}
                        </span>
                      </span>
                      <span>{currency(i.amount)}</span>
                    </div>
                  ))}
                </div>
                {admin &&
                  ["REQUESTED", "APPROVED", "PROCESSING"].includes(detail.workflowStatus) && (
                    <>
                      <Label title='Admin note / rejection or cancellation reason'>
                        <textarea
                          className={field}
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          maxLength={500}
                        />
                      </Label>
                      <Label title='Actual transfer reference'>
                        <input
                          className={field}
                          value={reference}
                          onChange={e => setReference(e.target.value)}
                          maxLength={120}
                        />
                      </Label>
                      <p className='text-xs text-slate-400'>
                        Mark paid only after manually transferring funds. Cancel processing only
                        after confirming the transfer was stopped.
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {(detail.workflowStatus === "REQUESTED"
                          ? ["APPROVED", "REJECTED", "CANCELLED"]
                          : detail.workflowStatus === "APPROVED"
                            ? ["PROCESSING", "REJECTED", "CANCELLED"]
                            : ["PAID", "CANCELLED"]
                        ).map(status => (
                          <button
                            key={status}
                            disabled={busy}
                            className={button}
                            onClick={async () => {
                              if (
                                await mutate(
                                  `${root}/payouts/${detail.id}`,
                                  {
                                    status,
                                    note,
                                    transactionReference: reference,
                                  },
                                  "patch"
                                )
                              )
                                setDetail(null);
                            }}
                          >
                            {status.replaceAll("_", " ")}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                {!admin && detail.workflowStatus === "REQUESTED" && (
                  <button
                    disabled={busy}
                    className={button}
                    onClick={async () => {
                      if (
                        await mutate(
                          `${root}/payouts/${detail.id}`,
                          { status: "CANCELLED" },
                          "patch"
                        )
                      )
                        setDetail(null);
                    }}
                  >
                    Cancel request
                  </button>
                )}
              </div>
            )}
            {refundEntry && (
              <form
                className='space-y-4'
                onSubmit={async e => {
                  e.preventDefault();
                  if (
                    await mutate(`${root}/order-items/${refundEntry.orderItemId}/refund`, {
                      refundReference: reference,
                      note,
                    })
                  )
                    setRefundEntry(null);
                }}
              >
                <h2 className='text-xl font-semibold'>Record completed refund</h2>
                <p>
                  {refundEntry.productTitle} · {currency(refundEntry.netSaleAmount)}
                </p>
                <p className='text-sm text-slate-400'>
                  This records a full product line refund that you have already transferred.
                  Shipping is excluded. Reserved requests may be cancelled; paid instructor earnings
                  become a recovery adjustment.
                </p>
                <Label title='Refund transfer reference'>
                  <input
                    required
                    className={field}
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    maxLength={120}
                  />
                </Label>
                <Label title='Reason'>
                  <textarea
                    required
                    minLength={5}
                    maxLength={500}
                    className={field}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </Label>
                <button
                  disabled={busy}
                  className={button}
                >
                  Record refund reversal
                </button>
              </form>
            )}
            {override && (
              <form
                className='space-y-4'
                onSubmit={async e => {
                  e.preventDefault();
                  if (
                    await mutate(
                      `${root}/instructors/${override.id}/commission`,
                      {
                        bookCommissionRate: bookRate === "" ? null : bookRate,
                        courseCommissionRate: courseRate === "" ? null : courseRate,
                      },
                      "patch"
                    )
                  )
                    setOverride(null);
                }}
              >
                <h2 className='text-xl font-semibold'>
                  {override.displayName} · commission override
                </h2>
                <p className='text-sm text-slate-400'>
                  Leave blank to inherit the global default. Product rates take priority.
                </p>
                <Label title='Book commission (%)'>
                  <input
                    type='number'
                    min='0'
                    max='100'
                    step='0.01'
                    className={field}
                    value={bookRate}
                    onChange={e => setBookRate(e.target.value)}
                  />
                </Label>
                <Label title='Course commission (%)'>
                  <input
                    type='number'
                    min='0'
                    max='100'
                    step='0.01'
                    className={field}
                    value={courseRate}
                    onChange={e => setCourseRate(e.target.value)}
                  />
                </Label>
                <button
                  disabled={busy}
                  className={button}
                >
                  Save override
                </button>
              </form>
            )}
            {error && (
              <p
                role='alert'
                className='mt-4 text-red-300'
              >
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
function ProductCommission({
  root,
  onSave,
}: {
  root: string;
  onSave: (path: string, body: unknown, method?: "post" | "patch") => Promise<boolean>;
}) {
  const [type, setType] = useState("book"),
    [id, setId] = useState(""),
    [value, setValue] = useState(""),
    [source, setSource] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className='space-y-3 border-t border-slate-700 pt-5 sm:col-span-2'>
      <h3 className='text-lg font-semibold'>Existing product commission</h3>
      <p className='text-sm text-slate-400'>
        Paste the product ID from its details URL. Blank rate restores instructor/global inheritance
        for future sales.
      </p>
      <div className='grid gap-3 sm:grid-cols-3'>
        <Label title='Type'>
          <select
            className={field}
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value='book'>Book</option>
            <option value='course'>Course</option>
          </select>
        </Label>
        <Label title='Product ID'>
          <input
            className={field}
            value={id}
            onChange={e => setId(e.target.value)}
          />
        </Label>
        <Label title='Commission (%)'>
          <input
            type='number'
            min='0'
            max='100'
            step='0.01'
            className={field}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </Label>
      </div>
      <div className='flex gap-3'>
        <button
          type='button'
          disabled={busy || !id}
          className={button}
          onClick={async () => {
            setBusy(true);
            setError("");
            const r = await apiClient.get<{ rate: string; source: string }>(
              `${root}/products/${type}/${encodeURIComponent(id)}/commission`
            );
            if (r.success && r.data) {
              setValue(String(r.data.rate));
              setSource(r.data.source);
            } else setError(r.message ?? "Product not found.");
            setBusy(false);
          }}
        >
          Load rate
        </button>
        <button
          type='button'
          disabled={busy || !id}
          className={button}
          onClick={async () => {
            setBusy(true);
            await onSave(
              `${root}/products/${type}/${encodeURIComponent(id)}/commission`,
              { rate: value === "" ? null : value },
              "patch"
            );
            setBusy(false);
          }}
        >
          Update product rate
        </button>
      </div>
      {source && <p className='text-sm text-slate-400'>Resolved from {source}</p>}
      {error && (
        <p
          role='alert'
          className='text-red-300'
        >
          {error}
        </p>
      )}
    </div>
  );
}
