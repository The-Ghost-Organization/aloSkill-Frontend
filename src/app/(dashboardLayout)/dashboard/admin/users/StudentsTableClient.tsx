"use client";

import { AlertTriangle, Eye, LoaderCircle, Plus, Search, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { createAdminUser, getAdminUserDetails, runAdminUserAction } from "./action";
import type {
  AdminUser,
  AdminUserAction,
  AdminUserDetails,
  CreateAdminUserInput,
  UserRole,
} from "./student.type";

const money = (value: number) =>
  `৳${Number(value).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
const date = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Never";
const PAGE_SIZE = 10;
const input =
  "w-full rounded-lg border border-slate-700 bg-[#08162a] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-orange-500";
const label = "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500";

function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "red" | "orange" | "blue";
}) {
  const colors = {
    slate: "bg-slate-700/50 text-slate-300",
    green: "bg-emerald-500/10 text-emerald-400",
    red: "bg-red-500/10 text-red-400",
    orange: "bg-orange-500/10 text-orange-400",
    blue: "bg-blue-500/10 text-blue-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${colors[tone]}`}
    >
      {children}
    </span>
  );
}

function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const base = Object.fromEntries(form.entries()) as Record<string, unknown>;
    const payload = {
      ...base,
      role,
      isEmailVerified: form.get("isEmailVerified") === "on",
      experience: Number(form.get("experience") ?? 0),
      teachingExperience: Number(form.get("teachingExperience") ?? 0),
      skills: String(form.get("skills") ?? "")
        .split(",")
        .map(value => value.trim())
        .filter(Boolean),
    } as unknown as CreateAdminUserInput;
    startTransition(async () => {
      const result = await createAdminUser(payload);
      if (!result.success) return setError(result.message ?? "Could not create user.");
      onCreated();
      onClose();
    });
  };
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className='fixed inset-0 z-[120] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm'
      onMouseDown={onClose}
    >
      <form
        onSubmit={submit}
        onMouseDown={event => event.stopPropagation()}
        className='flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded border border-slate-700 bg-[#0d1f3c] shadow-2xl'
      >
        <header className='flex items-center justify-between border-b border-slate-700 px-6 py-4'>
          <div>
            <h2 className='font-bold text-slate-100'>Add user</h2>
            <p className='text-xs text-slate-500'>
              Create a student or a complete instructor profile.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-2 text-slate-400 hover:bg-slate-800'
          >
            <X size={18} />
          </button>
        </header>
        <div className='overflow-y-auto p-6'>
          <div className='mb-5 grid grid-cols-2 gap-2 rounded-xl bg-[#08162a] p-1'>
            {(["STUDENT", "INSTRUCTOR"] as const).map(value => (
              <button
                key={value}
                type='button'
                onClick={() => setRole(value)}
                className={`rounded-lg py-2 text-xs font-semibold ${role === value ? "bg-orange-500 text-white" : "text-slate-400"}`}
              >
                {value === "STUDENT" ? "User" : "Instructor"}
              </button>
            ))}
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field
              name='displayName'
              title='Full name'
              required
            />
            <Field
              name='email'
              title='Email'
              type='email'
              required
            />
            <Field
              name='password'
              title='Temporary password'
              type='password'
              minLength={8}
              required
            />
            <Field
              name='phoneNumber'
              title='Phone number'
              required
            />
            <Field
              name='avatarUrl'
              title='Avatar URL'
              type='url'
            />
            <Select
              name='gender'
              title='Gender'
              values={["MALE", "FEMALE"]}
            />
            {role === "INSTRUCTOR" && (
              <>
                <Field
                  name='DOB'
                  title='Date of birth'
                  type='date'
                  required
                />
                <Field
                  name='nationality'
                  title='Nationality'
                  required
                />
                <Field
                  name='address'
                  title='Address'
                  required
                />
                <Field
                  name='city'
                  title='City'
                  required
                />
                <Field
                  name='qualifications'
                  title='Qualifications'
                  required
                />
                <Field
                  name='experience'
                  title='Professional experience (years)'
                  type='number'
                  min='0'
                  defaultValue='0'
                  required
                />
                <Field
                  name='expertise'
                  title='Expertise'
                />
                <Field
                  name='currentOrg'
                  title='Current organization'
                />
                <Field
                  name='proposedCourseCategory'
                  title='Proposed course category'
                  required
                />
                <Select
                  name='courseLevel'
                  title='Course level'
                  values={["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]}
                />
                <Select
                  name='courseType'
                  title='Course type'
                  values={["LIVE", "PRE_RECORDED", "HYBRID", "SELF_STUDY"]}
                />
                <Field
                  name='teachingExperience'
                  title='Teaching experience (years)'
                  type='number'
                  min='0'
                  step='0.5'
                  defaultValue='0'
                  required
                />
                <Select
                  name='prevTeachingApproach'
                  title='Teaching approach'
                  values={["INTERACTIVE", "VIDEO", "LIVE", "PROJECT_BASED"]}
                />
                <Select
                  name='language'
                  title='Teaching language'
                  values={["BANGLA", "ENGLISH"]}
                />
                <Field
                  name='demoVideo'
                  title='Demo video URL'
                  type='url'
                />
                <Field
                  name='website'
                  title='Website URL'
                  type='url'
                />
                <Field
                  name='skills'
                  title='Skills (comma separated)'
                />
                <Select
                  name='applicationStatus'
                  title='Application status'
                  values={["APPROVED", "PENDING"]}
                />
              </>
            )}
            <label className='sm:col-span-2'>
              <span className={label}>Bio {role === "INSTRUCTOR" && "*"}</span>
              <textarea
                name='bio'
                required={role === "INSTRUCTOR"}
                minLength={role === "INSTRUCTOR" ? 10 : undefined}
                rows={3}
                className={input}
              />
            </label>
            <label className='flex items-center gap-2 text-sm text-slate-300 sm:col-span-2'>
              <input
                name='isEmailVerified'
                type='checkbox'
                defaultChecked
                className='accent-orange-500'
              />{" "}
              Mark email verified and activate account
            </label>
          </div>
          {error && (
            <p className='mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300'>
              {error}
            </p>
          )}
        </div>
        <footer className='flex justify-end gap-3 border-t border-slate-700 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300'
          >
            Cancel
          </button>
          <button
            disabled={busy}
            className='inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60'
          >
            {busy && (
              <LoaderCircle
                size={15}
                className='animate-spin'
              />
            )}
            Create {role === "STUDENT" ? "user" : "instructor"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { title: string }) {
  const { title, ...rest } = props;
  return (
    <label>
      <span className={label}>{title}</span>
      <input
        {...rest}
        name={rest.name}
        className={input}
      />
    </label>
  );
}
function Select({ name, title, values }: { name: string; title: string; values: string[] }) {
  return (
    <label>
      <span className={label}>{title}</span>
      <select
        name={name}
        className={input}
      >
        {values.map(value => (
          <option
            key={value}
            value={value}
          >
            {value.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function UserDrawer({
  user,
  onClose,
  onChanged,
}: {
  user: AdminUser;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [details, setDetails] = useState<AdminUserDetails | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, startTransition] = useTransition();
  useEffect(() => {
    document.body.style.overflow = "hidden";
    getAdminUserDetails(user.id).then(result =>
      result.success && result.data
        ? setDetails(result.data)
        : setError(result.message ?? "Could not load user.")
    );
    return () => {
      document.body.style.overflow = "";
    };
  }, [user.id]);
  const action = (kind: AdminUserAction) =>
    startTransition(async () => {
      setError("");
      const result = await runAdminUserAction(user.id, kind, note);
      if (!result.success) return setError(result.message ?? "Action failed.");
      const refreshed = await getAdminUserDetails(user.id);
      if (refreshed.success && refreshed.data) setDetails(refreshed.data);
      setNote("");
      onChanged();
    });
  const current = details ?? user;
  return (
    <div
      className='fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-[2px]'
      onMouseDown={onClose}
    >
      <aside
        onMouseDown={event => event.stopPropagation()}
        className='ml-auto flex h-dvh w-full max-w-2xl flex-col border-l border-slate-700 bg-[#071426] shadow-2xl'
      >
        <header className='flex shrink-0 items-center justify-between border-b border-slate-700 px-5 py-4'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-orange-400'>
              User record
            </p>
            <h2 className='mt-1 font-bold text-slate-100'>{current.displayName}</h2>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-slate-400 hover:bg-slate-800'
          >
            <X size={18} />
          </button>
        </header>
        <div className='flex-1 overflow-y-auto p-5'>
          {!details && !error && (
            <div className='grid h-48 place-items-center'>
              <LoaderCircle className='animate-spin text-orange-400' />
            </div>
          )}
          {error && (
            <p className='mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300'>{error}</p>
          )}
          {details && (
            <div className='space-y-5'>
              {details.status === "SUSPENDED" && (
                <div className='flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200'>
                  <AlertTriangle
                    className='shrink-0'
                    size={19}
                  />
                  <div>
                    <strong className='text-sm'>Account suspended</strong>
                    <p className='mt-1 text-xs'>{details.suspendReason || "No reason recorded."}</p>
                  </div>
                </div>
              )}
              <section className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {[
                  ["Orders", details._count.orders],
                  [
                    "Paid total",
                    money(
                      details.payments
                        .filter(p => p.status === "SUCCEEDED")
                        .reduce((sum, p) => sum + p.amount, 0)
                    ),
                  ],
                  ["Enrollments", details._count.enrollments],
                  ["Reviews", details._count.reviews],
                ].map(([key, value]) => (
                  <div
                    key={String(key)}
                    className='rounded-xl border border-slate-800 bg-[#0d1f3c] p-3'
                  >
                    <p className='text-[10px] uppercase text-slate-500'>{key}</p>
                    <p className='mt-1 font-bold text-slate-100'>{value}</p>
                  </div>
                ))}
              </section>
              <Card title='Account & contact'>
                <Info
                  name='Email'
                  value={details.email}
                />
                <Info
                  name='Phone'
                  value={details.phoneNumber ?? "Not provided"}
                />
                <Info
                  name='Role'
                  value={details.roles.join(", ").replaceAll("STUDENT", "USER")}
                />
                <Info
                  name='Status'
                  value={details.status.replaceAll("_", " ")}
                />
                <Info
                  name='Email verified'
                  value={details.isEmailVerified ? "Yes" : "No"}
                />
                <Info
                  name='Joined'
                  value={date(details.createdAt)}
                />
                <Info
                  name='Last login'
                  value={date(details.lastLogin)}
                />
                <Info
                  name='Last activity'
                  value={date(details.lastActivityAt)}
                />
              </Card>
              {details.instructorProfile && (
                <Card title='Instructor profile'>
                  <Info
                    name='Application'
                    value={details.instructorProfile.status}
                  />
                  <Info
                    name='Expertise'
                    value={details.instructorProfile.expertise ?? "—"}
                  />
                  <Info
                    name='Experience'
                    value={`${details.instructorProfile.experience} years`}
                  />
                  <Info
                    name='Qualifications'
                    value={details.instructorProfile.qualifications}
                  />
                  <Info
                    name='Rating'
                    value={`${details.instructorProfile.ratingAverage.toFixed(1)} (${details.instructorProfile.ratingCount})`}
                  />
                  <Info
                    name='Students'
                    value={String(details.instructorProfile.totalStudents)}
                  />
                  <Info
                    name='Gross revenue'
                    value={money(details.instructorProfile.totalRevenueAmount)}
                  />
                  <Info
                    name='Skills'
                    value={details.instructorProfile.skills.join(", ") || "—"}
                  />
                </Card>
              )}
              {details.instructorProfile?.ownedCourses.length ? (
                <Card title='Instructor courses'>
                  <div className='col-span-2 space-y-2'>
                    {details.instructorProfile.ownedCourses.map(course => (
                      <Link
                        key={course.id}
                        href={`/dashboard/admin/courses/${course.id}`}
                        className='flex items-center justify-between rounded-lg border border-slate-800 p-3 hover:border-orange-500/50'
                      >
                        <span className='truncate text-sm text-slate-200'>{course.title}</span>
                        <span className='ml-3 text-xs text-slate-500'>
                          {course.enrollmentCount} enrolled
                        </span>
                      </Link>
                    ))}
                  </div>
                </Card>
              ) : null}
              <Card title='Recent orders'>
                <div className='col-span-2 space-y-2'>
                  {details.orders.length ? (
                    details.orders.map(order => (
                      <div
                        key={order.id}
                        className='flex items-center justify-between rounded-lg border border-slate-800 p-3'
                      >
                        <div>
                          <p className='text-xs text-slate-300'>#{order.id.slice(0, 8)}</p>
                          <p className='text-[10px] text-slate-500'>
                            {date(order.createdAt)} · {order._count.orderItems} items
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-xs font-semibold text-slate-200'>
                            {money(order.totalAmount)}
                          </p>
                          <p className='text-[10px] text-slate-500'>{order.status}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-sm text-slate-500'>No orders.</p>
                  )}
                </div>
              </Card>
              <section className='rounded-xl border border-slate-700 bg-[#0d1f3c] p-4'>
                <h3 className='text-sm font-bold text-slate-100'>Admin actions</h3>
                <p className='mt-1 text-xs text-slate-500'>
                  Sensitive actions are audit logged. A reason is required for suspension or
                  rejection.
                </p>
                <textarea
                  value={note}
                  onChange={event => setNote(event.target.value)}
                  placeholder='Admin note / reason'
                  rows={3}
                  className={`${input} mt-3`}
                />
                <div className='mt-3 flex flex-wrap gap-2'>
                  {!details.isEmailVerified && (
                    <ActionButton
                      onClick={() => action("VERIFY_EMAIL")}
                      disabled={busy}
                    >
                      Verify email
                    </ActionButton>
                  )}
                  {details.status === "SUSPENDED" || details.status === "INACTIVE" ? (
                    <ActionButton
                      onClick={() => action("REACTIVATE")}
                      disabled={busy}
                    >
                      Reactivate
                    </ActionButton>
                  ) : (
                    <ActionButton
                      danger
                      onClick={() => action("SUSPEND")}
                      disabled={busy || note.trim().length < 5}
                    >
                      Suspend
                    </ActionButton>
                  )}
                  {details.instructorProfile?.status === "PENDING" && (
                    <>
                      <ActionButton
                        onClick={() => action("APPROVE_INSTRUCTOR")}
                        disabled={busy}
                      >
                        Approve instructor
                      </ActionButton>
                      <ActionButton
                        danger
                        onClick={() => action("REJECT_INSTRUCTOR")}
                        disabled={busy || note.trim().length < 5}
                      >
                        Reject instructor
                      </ActionButton>
                    </>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='rounded-xl border border-slate-800 bg-[#0d1f3c] p-4'>
      <h3 className='mb-3 text-sm font-bold text-slate-100'>{title}</h3>
      <div className='grid grid-cols-2 gap-x-5 gap-y-3'>{children}</div>
    </section>
  );
}
function Info({ name, value }: { name: string; value: string }) {
  return (
    <div className='min-w-0'>
      <p className='text-[10px] uppercase text-slate-500'>{name}</p>
      <p className='mt-0.5 break-words text-xs text-slate-200'>{value}</p>
    </div>
  );
}
function ActionButton({
  danger,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      {...props}
      className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${danger ? "border border-red-500/30 bg-red-500/10 text-red-300" : "bg-orange-500 text-white"}`}
    />
  );
}

export default function StudentsTableClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"ALL" | UserRole>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [adding, setAdding] = useState(false);
  const users = useMemo(
    () =>
      initialUsers.filter(
        user =>
          (tab === "ALL" || user.roles.includes(tab)) &&
          `${user.displayName} ${user.email}`.toLowerCase().includes(search.toLowerCase())
      ),
    [initialUsers, search, tab]
  );
  const pages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visible = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [tab, search]);
  const refresh = () => router.refresh();
  return (
    <div className='animate-[pageEnter_0.3s_ease-out] space-y-5'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-100'>User management</h1>
          <p className='mt-1 text-sm text-slate-500'>{initialUsers.length} non-admin accounts</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className='inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white'
        >
          <Plus size={16} />
          Add user
        </button>
      </header>
      <section className='overflow-hidden rounded border border-slate-800 bg-[#0d1f3c]'>
        <div className='flex flex-wrap items-center gap-3 border-b border-slate-800 p-4'>
          <div className='flex rounded-lg bg-[#08162a] p-1'>
            {(["ALL", "STUDENT", "INSTRUCTOR"] as const).map(value => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`rounded-md px-3 py-2 text-xs font-semibold ${tab === value ? "bg-orange-500 text-white" : "text-slate-400"}`}
              >
                {value === "ALL" ? "All" : value === "STUDENT" ? "Users" : "Instructors"} (
                {value === "ALL"
                  ? initialUsers.length
                  : initialUsers.filter(user => user.roles.includes(value)).length}
                )
              </button>
            ))}
          </div>
          <label className='relative ml-auto w-full sm:w-72'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
              size={15}
            />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder='Search name or email…'
              className={`${input} pl-9`}
            />
          </label>
        </div>
        <div className='hidden overflow-hidden lg:block'>
          <table className='w-full table-fixed text-left'>
            <colgroup>
              <col className='w-[6%]' />
              <col className='w-[27%]' />
              <col className='w-[12%]' />
              <col className='w-[13%]' />
              <col className='w-[10%]' />
              <col className='w-[12%]' />
              <col className='w-[14%]' />
              <col className='w-[6%]' />
            </colgroup>
            <thead className='bg-[#08162a] text-[10px] uppercase tracking-wider text-slate-500'>
              <tr>
                {["SL", "User", "Role", "Status", "Orders", "Paid total", "Joined", ""].map(
                  item => (
                    <th
                      key={item}
                      className='px-3 py-3'
                    >
                      {item}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800'>
              {visible.map((user, index) => (
                <tr
                  key={user.id}
                  className='hover:bg-slate-800/30'
                >
                  <td className='px-3 py-3 text-xs text-slate-500'>
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className='min-w-0 px-3 py-3'>
                    <p
                      className='truncate text-sm font-semibold text-slate-200'
                      title={user.displayName}
                    >
                      {user.displayName}
                    </p>
                    <p
                      className='truncate text-xs text-slate-500'
                      title={user.email}
                    >
                      {user.email}
                    </p>
                  </td>
                  <td className='px-3 py-3'>
                    <Pill tone={user.roles.includes("INSTRUCTOR") ? "blue" : "slate"}>
                      {user.roles.includes("INSTRUCTOR") ? "INSTRUCTOR" : "USER"}
                    </Pill>
                  </td>
                  <td className='px-3 py-3'>
                    <Pill
                      tone={
                        user.status === "ACTIVE"
                          ? "green"
                          : user.status === "SUSPENDED"
                            ? "red"
                            : "orange"
                      }
                    >
                      {user.status.replaceAll("_", " ")}
                    </Pill>
                  </td>
                  <td className='px-3 py-3 text-xs text-slate-300'>{user._count.orders}</td>
                  <td className='px-3 py-3 text-xs text-emerald-400'>{money(user.totalSpent)}</td>
                  <td className='px-3 py-3 text-xs text-slate-400'>{date(user.createdAt)}</td>
                  <td className='px-3 py-3'>
                    <button
                      title='View user'
                      aria-label={`View ${user.displayName}`}
                      onClick={() => setSelected(user)}
                      className='grid h-8 w-8 place-items-center rounded-lg border border-slate-700 text-slate-400 hover:border-orange-500 hover:text-orange-400'
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='divide-y divide-slate-800 lg:hidden'>
          {visible.map((user, index) => (
            <article
              key={user.id}
              className='p-4'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold text-slate-200'>
                    <span className='mr-2 text-slate-500'>
                      #{(page - 1) * PAGE_SIZE + index + 1}
                    </span>
                    {user.displayName}
                  </p>
                  <p className='truncate text-xs text-slate-500'>{user.email}</p>
                  <div className='mt-2 flex gap-2'>
                    <Pill tone={user.roles.includes("INSTRUCTOR") ? "blue" : "slate"}>
                      {user.roles.includes("INSTRUCTOR") ? "INSTRUCTOR" : "USER"}
                    </Pill>
                    <Pill
                      tone={
                        user.status === "ACTIVE"
                          ? "green"
                          : user.status === "SUSPENDED"
                            ? "red"
                            : "orange"
                      }
                    >
                      {user.status}
                    </Pill>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(user)}
                  className='grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-700 text-slate-400'
                >
                  <Eye size={15} />
                </button>
              </div>
              <div className='mt-3 grid grid-cols-3 text-xs'>
                <Info
                  name='Orders'
                  value={String(user._count.orders)}
                />
                <Info
                  name='Paid'
                  value={money(user.totalSpent)}
                />
                <Info
                  name='Joined'
                  value={date(user.createdAt)}
                />
              </div>
            </article>
          ))}
        </div>
        {!visible.length && (
          <div className='p-12 text-center'>
            <UserRound className='mx-auto text-slate-700' />
            <p className='mt-3 text-sm text-slate-500'>No matching users.</p>
          </div>
        )}
        <footer className='flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs text-slate-500'>
          <span>
            Showing {visible.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(page * PAGE_SIZE, users.length)} of {users.length}
          </span>
          <div className='flex gap-2'>
            <button
              disabled={page === 1}
              onClick={() => setPage(value => value - 1)}
              className='rounded border border-slate-700 px-3 py-1.5 disabled:opacity-40'
            >
              Previous
            </button>
            <span className='px-2 py-1.5'>
              {page} / {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => setPage(value => value + 1)}
              className='rounded border border-slate-700 px-3 py-1.5 disabled:opacity-40'
            >
              Next
            </button>
          </div>
        </footer>
      </section>
      {adding && (
        <AddUserModal
          onClose={() => setAdding(false)}
          onCreated={refresh}
        />
      )}{" "}
      {selected && (
        <UserDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
