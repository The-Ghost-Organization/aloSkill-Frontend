import Link from "next/link";
import { notFound } from "next/navigation";
import { getApproval, type ApprovalType } from "../../../action";
import DecisionPanel from "../../../DecisionPanel";

export const dynamic = "force-dynamic";
const names: Record<ApprovalType, string> = { book: "Book", course: "Course", instructor: "Instructor" };
const money = (value: unknown) => value == null ? "—" : `৳ ${Number(value).toLocaleString("en-BD")}`;
function Field({ label, value }: { label: string; value: unknown }) {
  return <div className="min-w-0 border-b border-slate-800 py-3 last:border-0"><dt className="text-xs uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm text-slate-200">{value == null || value === "" ? "—" : String(value)}</dd></div>;
}
function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="mb-3 text-base font-semibold text-white">{title}</h2>{children}</section>;
}
export default async function ReviewPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  if (!(["book", "course", "instructor"] as string[]).includes(type)) notFound();
  const kind = type as ApprovalType;
  const data = await getApproval(kind, id);
  if (!data) notFound();
  const title = kind === "instructor" ? data.displayName : data.title;
  return <main className="min-w-0 space-y-5 text-slate-100"><Link href="/dashboard/admin/approvals" className="inline-block text-sm text-orange-400 hover:underline">← Back to approvals</Link>
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-widest text-orange-400">{names[kind]} application · Pending</p><h1 className="mt-2 break-words text-2xl font-bold">{title}</h1><p className="mt-2 text-sm text-slate-400">Submitted {new Date(data.createdAt).toLocaleString("en-BD")}</p></div>
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="min-w-0 space-y-5">
      {kind === "book" && <>
        <Box title="Book details"><div className="flex flex-wrap gap-5">{data.coverImage && <img src={data.coverImage} alt="Book cover" className="h-48 w-32 rounded-lg object-cover" />}<dl className="min-w-0 flex-1"><Field label="Title" value={data.title}/><Field label="Author on cover" value={data.author}/><Field label="Description" value={data.description}/><Field label="Category" value={data.category?.name}/><Field label="Formats" value={data.formats?.join(", ")}/><Field label="Language" value={data.language}/><Field label="ISBN" value={data.isbn}/><Field label="Publisher" value={data.publisher}/><Field label="Publication year" value={data.publishYear}/><Field label="Edition" value={data.edition}/><Field label="Pages" value={data.pages}/></dl></div></Box>
        <Box title="Pricing and inventory"><dl className="grid gap-x-6 sm:grid-cols-2"><Field label="Physical regular" value={money(data.physicalRegularPrice)}/><Field label="Physical sale" value={money(data.physicalSalePrice)}/><Field label="Digital regular" value={money(data.digitalRegularPrice)}/><Field label="Digital sale" value={money(data.digitalSalePrice)}/><Field label="Stock" value={data.stock}/></dl></Box>
        <Box title="Author profile"><dl><Field label="Name" value={data.authorProfile?.name ?? data.author}/><Field label="Bio" value={data.authorProfile?.bio}/><Field label="Linked instructor" value={data.authorProfile?.instructorProfile?.displayName}/><Field label="Instructor email" value={data.authorProfile?.instructorProfile?.user?.email}/><Field label="Website" value={data.authorProfile?.websiteUrl}/></dl></Box>
        <Box title="Submitted by"><dl><Field label="Account email" value={data.owner?.email}/><Field label="Instructor" value={data.owner?.instructorProfile?.displayName}/><Field label="Instructor bio" value={data.owner?.instructorProfile?.bio}/></dl></Box>
        <Box title="Uploaded files"><div className="space-y-2">{data.files?.length ? data.files.map((f: any) => <div key={f.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-800 p-3 text-sm"><span>{f.name} · {f.fileType}</span><a href={f.url} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline">View file</a></div>) : <p className="text-sm text-slate-400">No files uploaded.</p>}</div></Box>
      </>}
      {kind === "course" && <>
        <Box title="Course overview">{data.thumbnailUrl && <img src={data.thumbnailUrl} alt="Course thumbnail" className="mb-4 max-h-64 w-full rounded-lg object-contain"/>}<dl><Field label="Title" value={data.title}/><Field label="Description" value={data.description}/><Field label="Category" value={data.category?.name}/><Field label="Level" value={data.level}/><Field label="Language" value={data.language}/><Field label="Original price" value={money(data.originalPrice)}/><Field label="Discount price" value={money(data.discountPrice)}/><Field label="Welcome message" value={data.welcomeMessage}/><Field label="Completion message" value={data.congratulationsMessage}/></dl>{data.trailerUrl && <a href={data.trailerUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-400 underline">Watch trailer</a>}</Box>
        <Box title="Instructor"><dl><Field label="Name" value={data.createdBy?.displayName}/><Field label="Email" value={data.createdBy?.user?.email}/><Field label="Bio" value={data.createdBy?.bio}/><Field label="Additional instructors" value={data.courseInstructors?.map((c: any) => c.instructor?.displayName).filter(Boolean).join(", ")}/></dl></Box>
        <Box title="Curriculum">{data.modules?.length ? data.modules.map((m: any) => <div key={m.id} className="mb-4 rounded-lg border border-slate-800 p-4"><h3 className="font-semibold">{m.title}</h3>{m.lessons?.length ? <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-300">{m.lessons.map((l: any) => <li key={l.id}>{l.title} · {l.type}{l.duration ? ` · ${l.duration} min` : ""}{l.description ? ` — ${l.description}` : ""}</li>)}</ol> : <p className="mt-2 text-sm text-slate-400">No lessons.</p>}</div>) : <p className="text-sm text-slate-400">No modules submitted.</p>}</Box>
      </>}
      {kind === "instructor" && <>
        <Box title="Personal profile"><div className="flex flex-wrap gap-5">{data.user?.avatarUrl && <img src={data.user.avatarUrl} alt="Profile" className="h-24 w-24 rounded-full object-cover"/>}<dl className="min-w-0 flex-1"><Field label="Display name" value={data.displayName}/><Field label="Email" value={data.user?.email}/><Field label="Phone ending" value={data.phoneLastFour ? `•••• ${data.phoneLastFour}` : null}/><Field label="Location" value={[data.city,data.nationality].filter(Boolean).join(", ")}/><Field label="Bio" value={data.bio}/></dl></div></Box>
        <Box title="Qualifications and teaching"><dl><Field label="Qualifications" value={data.qualifications}/><Field label="Experience (years)" value={data.experience}/><Field label="Teaching experience (years)" value={data.teachingExperience}/><Field label="Expertise" value={data.expertise}/><Field label="Skills" value={data.skills?.map((s: any) => s.skill).join(", ")}/><Field label="Organisation" value={data.currentOrg}/><Field label="Proposed category" value={data.proposedCourseCategory}/><Field label="Course level" value={data.courseLevel}/><Field label="Course type" value={data.courseType}/><Field label="Teaching approach" value={data.prevTeachingApproach}/><Field label="Language" value={data.language}/></dl>{data.demoVideo && <a href={data.demoVideo} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-400 underline">View demo video</a>}</Box>
        <Box title="Links and author profile"><dl><Field label="Website" value={data.website}/><Field label="Social links" value={data.socialAccount?.map((s: any) => `${s.platform}: ${s.url}`).join(" · ")}/><Field label="Linked author" value={data.authorProfile?.name}/><Field label="Author bio" value={data.authorProfile?.bio}/></dl></Box>
      </>}
      {data.adminNote && <Box title="Previous admin note"><p className="whitespace-pre-wrap text-sm text-amber-300">{data.adminNote}</p></Box>}
    </div><aside className="self-start xl:sticky xl:top-4"><DecisionPanel type={kind} id={id} title={title}/></aside></div>
  </main>;
}
