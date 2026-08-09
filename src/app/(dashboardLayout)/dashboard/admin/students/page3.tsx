// import { Plus, Search } from "lucide-react";
// import { Avatar, Badge, ProgressBar, SectionHeader, SlidePanel } from "../Components";
// import { STUDENTS } from "../Data";
// import { getAllStudents } from "./action";
// import type { StudentForAdmin } from "./student.type";
// import { StudentEyeViewButton, StudentSearchInput, StudentStatusFilter } from "./StudentComponents";

// const badgeVariant: Record<string, string> = { Platinum: "purple", Gold: "gold", None: "gray" };

// const filter: string = "all";
// const search: string = "";
// let panel: StudentForAdmin[0] | null = null;

// export default async function StudentsPage() {
//   // const [search, setSearch] = useState("");
//   // const [panel, setPanel] = useState<(typeof STUDENTS)[0] | null>(null);

//   const students = await getAllStudents();
//   if (!students) {
//     return <div className='text-red-500'>Failed to load students.</div>;
//   }

//   console.log("first: ", students);
//   console.log("filter : ", filter);

//   const filtered = students.filter(s => {
//     const m =
//       s.studentProfile?.displayName.toLowerCase().includes(search.toLowerCase()) ||
//       s.email.toLowerCase().includes(search.toLowerCase());
//     if (filter === "active") return m && s.status === "Active";
//     if (filter === "suspended") return m && s.status === "Suspended";
//     return m;
//   });

//   const changeFilter = async (value: string, filter: string) => {
//     "use server";
//     console.log("change filter : ", value);
//     filter = value;
//   };

//   return (
//     <div className='animate-[pageEnter_0.3s_ease-out]'>
//       <SectionHeader
//         title='Student Management'
//         sub={`${STUDENTS.length} registered students`}
//         action={
//           <button className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-['Outfit'] font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-px transition-all cursor-pointer border-none">
//             <Plus
//               size={14}
//               color='white'
//             />
//             Add Student
//           </button>
//         }
//       />

//       {/* Filters */}
//       <div className='flex gap-3 mb-5 items-center flex-wrap'>
//         <div className='relative flex-1 max-w-90'>
//           <Search
//             size={14}
//             className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
//           />
//           <StudentSearchInput search={search} />
//         </div>

//         <StudentStatusFilter
//           changeFilter={changeFilter}
//           filter={filter}
//         />

//         <select className="bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 pr-9 text-[13.5px] text-slate-100 font-['Outfit'] outline-none focus:border-orange-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_viewBox=%220_0_12_8%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22%233d5a80%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]">
//           <option>Sort: Enrollments</option>
//           <option>Sort: Spend</option>
//           <option>Sort: Completion</option>
//         </select>
//       </div>

//       <div className='bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-linear-to-br before:from-white/5 before:to-transparent before:pointer-events-none'>
//         <div className='overflow-x-auto'>
//           <table className='w-full border-collapse'>
//             <thead>
//               <tr className='border-bottom border-slate-800'>
//                 {[
//                   "Student",
//                   "Phone",
//                   "Courses",
//                   "Spend",
//                   "Completion",
//                   "Badge",
//                   "Status",
//                   "Joined",
//                   "Actions",
//                 ].map(h => (
//                   <th
//                     key={h}
//                     className='bg-slate-950/50 text-slate-500 text-[11px] font-semibold uppercase tracking-widest p-3.5 px-4.5 text-left font-mono border-b border-slate-800'
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className='divide-y divide-slate-800/50'>
//               {filtered.map((s, i) => (
//                 <tr
//                   key={i}
//                   className='transition-colors hover:bg-slate-800/40'
//                 >
//                   <td className='p-4 px-4.5 text-[13.5px] text-slate-100'>
//                     <div className='flex items-center gap-3'>
//                       <Avatar
//                         name={s.studentProfile?.displayName as string}
//                         size={34}
//                       />
//                       <div>
//                         <div className='font-semibold'>{s.studentProfile?.displayName}</div>
//                         <div className='text-xs text-slate-500'>{s.email}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className='p-4 px-4.5 text-xs text-slate-400 font-mono'>
//                     {s.studentProfile?.encryptedPhone}
//                   </td>
//                   <td className='p-4 px-4.5'>
//                     <Badge variant='blue'>{s._count.enrollments}</Badge>
//                   </td>
//                   <td className='p-4 px-4.5 text-[13.5px] font-semibold text-emerald-400 font-mono'>
//                     {s.orders.length}
//                   </td>
//                   <td className='p-4 px-4.5'>
//                     <div className='flex items-center gap-2 w-30'>
//                       <ProgressBar value={s.pct} />
//                       <span className='font-mono text-[11px] text-slate-400 min-w-7'>{s.pct}%</span>
//                     </div>
//                   </td>
//                   <td className='p-4 px-4.5'>
//                     <Badge variant={badgeVariant[s.badge]}>{s.badge}</Badge>
//                   </td>
//                   <td className='p-4 px-4.5'>
//                     <Badge variant={s.status === "Active" ? "green" : "red"}>{s.status}</Badge>
//                   </td>
//                   <td className='p-4 px-4.5 text-[13.5px] text-slate-500 font-mono'>
//                     {s.createdAt}
//                   </td>
//                   <td className='p-4 px-4.5'>
//                     <StudentEyeViewButton
//                       panel={panel}
//                       student={s}
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className='flex justify-between items-center p-3.5 px-4.5 border-t border-slate-800'>
//           <span className='text-xs text-slate-500'>
//             Showing {filtered.length} of {STUDENTS.length}
//           </span>
//           <div className='flex gap-1'>
//             {[1, 2, 3].map(p => (
//               <button
//                 key={p}
//                 className={`w-7.5 h-7.5 rounded-lg border font-semibold text-xs cursor-pointer transition-all ${
//                   p === 1
//                     ? "bg-orange-500 border-orange-500 text-white"
//                     : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
//                 }`}
//               >
//                 {p}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Slide Panel */}
//       {panel && (
//         <SlidePanel
//           onClose={() => (panel = null)}
//           title='Student Profile'
//         >
//           <div className='flex gap-4 mb-6'>
//             <Avatar
//               name={panel.avaterUrl}
//               size={56}
//             />
//             <div>
//               <div className="font-bold text-lg text-slate-100 font-['Syne']">{panel.name}</div>
//               <div className='text-[13px] text-slate-500'>{panel.email}</div>
//               <div className='flex gap-2 mt-2'>
//                 <Badge variant={panel.status === "Active" ? "green" : "red"}>{panel.status}</Badge>
//                 <Badge variant={badgeVariant[panel.badge]}>{panel.badge}</Badge>
//               </div>
//             </div>
//           </div>

//           <div className='grid grid-cols-3 gap-2.5 mb-5'>
//             {[
//               { l: "Courses", v: panel.courses },
//               { l: "Total Spend", v: panel.spend },
//               { l: "Completion", v: `${panel.pct}%` },
//             ].map(s => (
//               <div
//                 key={s.l}
//                 className='bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center'
//               >
//                 <div className="font-['Syne'] text-xl font-bold text-orange-500">{s.v}</div>
//                 <div className='font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-1'>
//                   {s.l}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className='mb-5'>
//             <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-2'>
//               Completion Progress
//             </div>
//             <ProgressBar value={panel.pct} />
//           </div>

//           <div className='bg-slate-900 rounded-xl border border-slate-800 p-4 mb-5 divide-y divide-slate-800'>
//             {[
//               ["Phone", panel.phone],
//               ["Joined", panel.joined],
//               ["Badge", panel.badge],
//             ].map(([k, v]) => (
//               <div
//                 key={k}
//                 className='flex justify-between py-2 first:pt-0 last:pb-0'
//               >
//                 <span className='font-mono text-[11px] uppercase tracking-wider text-slate-500'>
//                   {k}
//                 </span>
//                 <span className='text-[13px] text-slate-100 font-medium'>{v}</span>
//               </div>
//             ))}
//           </div>

//           <div className='grid grid-cols-2 gap-2 mb-3'>
//             <button className="flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-['Outfit'] font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all cursor-pointer">
//               Manual Enroll
//             </button>
//             <button className='flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 transition-all cursor-pointer'>
//               Assign Badge
//             </button>
//             <button className='flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer'>
//               {panel.status === "Active" ? "Suspend Account" : "Activate Account"}
//             </button>
//             <button className='flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 transition-all cursor-pointer'>
//               Trigger Refund
//             </button>
//           </div>

//           <div className='mt-5'>
//             <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-2'>
//               Admin Note (Private)
//             </div>
//             <textarea
//               className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-[13.5px] text-slate-100 font-['Outfit'] outline-none focus:border-orange-500 transition-all resize-none"
//               rows={3}
//               placeholder='Add internal note...'
//             />
//             <button className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-['Outfit'] font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all cursor-pointer">
//               Save Note
//             </button>
//           </div>
//         </SlidePanel>
//       )}
//     </div>
//   );
// }
