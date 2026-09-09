"use client";

import { Badge, SectionHeader } from "../Components";

const sections = [
  { title: "Homepage Banner", icon: "🖼️", desc: "Hero banners and call-to-actions", count: 3 },
  { title: "Featured Courses", icon: "⭐", desc: "Spotlight section on homepage", count: 6 },
  { title: "Blog Management", icon: "📝", desc: "Articles and announcements", count: 14 },
  { title: "Testimonials", icon: "💬", desc: "Student success stories", count: 8 },
  { title: "FAQ Management", icon: "❓", desc: "Common questions & answers", count: 24 },
  { title: "Static Pages", icon: "📄", desc: "Terms, Privacy, Refund Policy", count: 5 },
  { title: "SEO Settings", icon: "🔍", desc: "Meta tags and optimization", count: null },
  { title: "Email Templates", icon: "✉️", desc: "Welcome, receipt, approval", count: 12 },
];

export default function CMSPage() {
  return (
    <div className='animate-page-enter'>
      <SectionHeader
        title='CMS & Content'
        sub='Manage all website content, pages and marketing'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {sections.map(s => (
          <div
            key={s.title}
            className='group relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5.5 cursor-pointer transition-all duration-200 hover:border-orange-500/30 hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'
          >
            {/* Icon */}
            <div className='text-3xl mb-3 transition-transform duration-200 group-hover:scale-110 origin-left'>
              {s.icon}
            </div>

            {/* Title */}
            <div className="font-['Syne'] font-bold text-base text-slate-100 mb-1.5">{s.title}</div>

            {/* Description */}
            <div className='text-xs text-slate-500 mb-3.5 leading-relaxed'>{s.desc}</div>

            {/* Footer */}
            <div className='flex justify-between items-center'>
              {s.count !== null ? <Badge variant='gray'>{s.count} items</Badge> : <div />}
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-['Outfit'] text-xs font-semibold transition-all bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-950 hover:text-slate-100 hover:border-slate-700 ml-auto cursor-pointer">
                Manage →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
