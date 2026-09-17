import type { InstructorDetail } from "./Approvaldata";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className='rounded-2xl border border-slate-800 overflow-hidden'
      style={{ background: "#0d1f3c" }}
    >
      <div
        className='px-5 py-3.5 border-b border-slate-800'
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <span className='font-mono text-[11px] uppercase tracking-widest text-slate-500'>
          {title}
        </span>
      </div>
      <div className='p-5'>{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className='flex justify-between items-center py-2 border-b border-slate-800/60 last:border-0'>
      <span className='font-mono text-[11px] uppercase tracking-wider text-slate-500'>{label}</span>
      <span
        className='text-[13px] font-semibold'
        style={{ color: accent ? "#da7c36" : "#e8f0fe" }}
      >
        {value}
      </span>
    </div>
  );
}

function DocStatusBadge({ status }: { status: string }) {
  const isVerified = status === "Verified";
  const isSubmitted = status === "Submitted";
  return (
    <span
      className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold'
      style={{
        background: isVerified
          ? "rgba(0,229,160,0.1)"
          : isSubmitted
            ? "rgba(255,193,7,0.1)"
            : "rgba(255,71,87,0.1)",
        border: `1px solid ${isVerified ? "rgba(0,229,160,0.2)" : isSubmitted ? "rgba(255,193,7,0.2)" : "rgba(255,71,87,0.2)"}`,
        color: isVerified ? "#00e5a0" : isSubmitted ? "#ffc107" : "#ff4757",
      }}
    >
      {isVerified ? "✓" : isSubmitted ? "⏳" : "✗"} {status}
    </span>
  );
}

export default function InstructorReviewDetail({ instructor }: { instructor: InstructorDetail }) {
  // Initials for avatar
  const initials = instructor.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className='space-y-4'>
      {/* Hero */}
      <div
        className='rounded-2xl border border-slate-800 p-6'
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}
      >
        <div className='flex items-start gap-5'>
          {/* Avatar */}
          <div
            className='w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shrink-0'
            style={{
              background: "linear-gradient(135deg, #074079, #da7c36)",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {initials}
          </div>
          <div className='flex-1 min-w-0'>
            <h2
              className='text-xl font-extrabold text-slate-100 mb-1'
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {instructor.name}
            </h2>

            <div className='text-[13px] text-slate-400 mb-3'>{instructor.email}</div>
            <div className='flex items-center gap-2 flex-wrap'>
              <span
                className='inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold'
                style={{
                  background: "rgba(74,158,255,0.1)",
                  border: "1px solid rgba(74,158,255,0.2)",
                  color: "#4a9eff",
                }}
              >
                🌍 {instructor.country}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className='text-[13px] text-slate-400 leading-relaxed mt-5 pt-5 border-t border-slate-800/60'>
          {instructor.bio}
        </p>

        {/* Expertise chips */}
        <div className='flex flex-wrap gap-2 mt-4'>
          {instructor.expertise.map(e => (
            <span
              key={e}
              className='inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold'
              style={{
                background: "rgba(218,124,54,0.1)",
                border: "1px solid rgba(218,124,54,0.2)",
                color: "#fc9759",
              }}
            >
              {e}
            </span>
          ))}
        </div>

        {/* Stats if returning instructor */}
        {instructor.existingCourses !== undefined && (
          <div className='grid grid-cols-3 gap-3 mt-5'>
            {[
              { l: "Courses", v: instructor.existingCourses },
              { l: "Students", v: instructor.existingStudents?.toLocaleString() ?? "—" },
              { l: "Rating", v: `⭐ ${instructor.existingRating}` },
            ].map(s => (
              <div
                key={s.l}
                className='rounded-xl p-3 text-center'
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className='text-lg font-bold text-slate-100'
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {s.v}
                </div>
                <div className='font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-0.5'>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal info */}
      <Section title='Personal Information'>
        <InfoRow
          label='Full Name'
          value={instructor.name}
          accent
        />
        <InfoRow
          label='Email'
          value={instructor.email}
        />
        <InfoRow
          label='Phone'
          value={instructor.phone}
        />
        <InfoRow
          label='Gender'
          value={instructor.phone}
        />
        <InfoRow
          label='Age'
          value={instructor.phone}
        />
        <InfoRow
          label='Country'
          value={instructor.country}
        />
        <InfoRow
          label='Address'
          value={instructor.country}
        />
        <InfoRow
          label='City'
          value={instructor.country}
        />
        <InfoRow
          label='Website'
          value={instructor.country}
        />
        <InfoRow
          label='Submitted'
          value={instructor.submittedAt}
        />
      </Section>

      {/* Education & experience */}
      <Section title='Education & Experience'>
        <div className='mb-4'>
          <div className='font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5'>
            Education
          </div>
          <div className='text-[13px] text-slate-200 font-medium'>{instructor.education}</div>
        </div>
        <div>
          <div className='font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5'>
            Experience
          </div>
          <div className='text-[13px] text-slate-200 font-medium'>{instructor.experience}</div>
        </div>
      </Section>

      {/* Course info */}
      <Section title='Course Information'>
        <InfoRow
          label='Course Type'
          value={instructor.email}
        />
        <InfoRow
          label='Course Level'
          value={instructor.phone}
        />
        <InfoRow
          label='Proposed Course Category'
          value={instructor.phone}
        />
        <InfoRow
          label='Language'
          value={instructor.phone}
        />
        <InfoRow
          label='Teaching Experience'
          value={instructor.country}
        />
        <InfoRow
          label='Prev Teaching Approach'
          value={instructor.country}
        />
        <InfoRow
          label='Demo Video Link'
          value={instructor.country}
        />
      </Section>

      {/* Social links */}
      <Section title='Social & Portfolio Links'>
        <div className='space-y-2'>
          {instructor.socialLinks.map(link => (
            <a
              key={link.platform}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group'
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className='text-[13px] font-semibold text-slate-300 group-hover:text-slate-100'>
                {link.platform}
              </span>
              <span className='text-[12px] text-blue-400 truncate ml-3 max-w-50'>{link.url}</span>
            </a>
          ))}
        </div>
      </Section>

      {/* Previous admin notes */}
      {instructor.previousNotes && (
        <div
          className='rounded-2xl p-4 flex gap-3'
          style={{ background: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.2)" }}
        >
          <svg
            viewBox='0 0 24 24'
            width={16}
            height={16}
            fill='#ffc107'
            className='shrink-0 mt-0.5'
          >
            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
          </svg>
          <div>
            <div className='font-mono text-[10px] uppercase tracking-wider text-yellow-600 mb-1'>
              Previous Admin Note
            </div>
            <div className='text-[12px] text-yellow-200/70 leading-relaxed'>
              {instructor.previousNotes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
