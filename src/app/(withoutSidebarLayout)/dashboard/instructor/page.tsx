import { BookOpen, Users } from "lucide-react";
import Link from "next/link";

// Mock data
const stats = [
  {
    label: "Total Courses",
    value: "357",
    icon: BookOpen,
    color: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    label: "Total Students",
    value: "19",
    icon: Users,
    color: "bg-purple-100",
    iconColor: "text-purple-500",
  },
  {
    label: "Total Instructors",
    value: "241",
    icon: Users,
    color: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    label: "Total Enrolled",
    value: "953",
    icon: BookOpen,
    color: "bg-green-100",
    iconColor: "text-green-500",
  },
  {
    label: "Total Courses",
    value: "357",
    icon: BookOpen,
    color: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    label: "Total Students",
    value: "19",
    icon: Users,
    color: "bg-purple-100",
    iconColor: "text-purple-500",
  },
  {
    label: "Total Instructors",
    value: "241",
    icon: Users,
    color: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    label: "Total Enrolled",
    value: "955",
    icon: BookOpen,
    color: "bg-green-100",
    iconColor: "text-green-500",
  },
];

const activities = [
  {
    action: "Nolan published new article",
    detail: '"What is UX" in user\'s design what will happen',
    time: "2 hours ago",
    color: "bg-orange-500",
  },
  {
    action: "Arlene is out of office at your course",
    detail: "SEO take your blog",
    time: "3 hours ago",
    color: "bg-orange-500",
  },
  {
    action: "Subbed",
    detail: 'purchase your course "SEO" and design what will happen',
    time: "4 hours ago",
    color: "bg-orange-500",
  },
  {
    action: "Von is trusting you course",
    detail: "SEO has been design with your blog",
    time: "1 hours ago",
    color: "bg-orange-500",
  },
];

const Dashboard = () => {
  return (
    <div className=''>
      <div className='flex flex-col gap-4 overflow-auto'>
        {/* Stats Grid */}
        <div className='w-full grid grid-cols-4 gap-4'>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className='bg-white rounded px-3 py-2 flex items-center gap-3'
            >
              <div className='flex items-center justify-between'>
                <div className={`w-12 h-12 ${stat.color} rounded flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <div className='text-xl font-bold text-gray-800'>{stat.value}</div>
                <div className='text-sm text-gray-500'>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Progress Section */}
        <div className='bg-gradient-to-r from-[#0F172A] to-[#0B1120] rounded p-5 text-white'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='w-16 h-16 rounded-full bg-white overflow-hidden'>
                <div className='w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center'>
                  <span className='text-white font-bold text-xl'>VS</span>
                </div>
              </div>
              <div>
                <h3 className='text-xl font-semibold'>Valio Shirdi</h3>
                <p className='text-indigo-200 text-sm'>UX Designer</p>
              </div>
            </div>
            <div className='flex items-center gap-5'>
              <div className='flex items-center gap-5'>
                <div className='text-sm text-indigo-200'>1/4 Steps</div>
                <div className='w-64 h-3 bg-[#172b5d] overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-green-400 to-green-500'
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-sm text-indigo-200'>30% Completed</div>
              </div>
              <Link href='/dashboard/instructor/settings'>
                <button className='px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded font-medium transition-colors cursor-pointer'>
                  Edit Biography
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='w-full h-[400px] flex gap-3'>
          {/* Recent Activity */}
          <div className='bg-white rounded h-full w-[30%] overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold'>Recent Activity</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>
            <div className='flex flex-col gap-4 p-4'>
              {activities.map((activity, idx) => (
                <div
                  key={idx}
                  className='flex gap-3'
                >
                  <div className={`w-4 h-4 ${activity.color} rounded-full mt-1`}></div>
                  <div className='flex-1 flex flex-col gap-1'>
                    <p className='text-sm font-medium text-gray-800'>{activity.action}</p>
                    <p className='text-xs text-gray-500'>{activity.detail}</p>
                    <p className='text-xs text-gray-400'>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className='bg-white rounded flex-1 overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold'>Reviews</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>
            <div></div>
          </div>

          {/* Profile View */}
          <div className='bg-white rounded w-[25%] h-full overflow-y-auto'>
            <div className='flex items-center justify-between border-b border-gray-200 p-4'>
              <h4 className='font-semibold'>Profile View</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                Today →
              </a>
            </div>
          </div>
        </div>

        <div className='w-full h-[400px] flex gap-3 mb-4'>
          <div className='bg-white rounded h-full w-[40%] overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold'>Overall Course Ratings</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>
            <div>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2 px-4 py-3 border-b border-gray-200'>
                  <div className='flex flex-col gap-1 items-center justify-center bg-[#FFF2E5] w-[40%] aspect-square rounded'>
                    <div className='text-3xl font-bold text-gray-800'>4.6</div>
                    <div className='flex items-center justify-center'>
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className='w-4 h-4 text-orange-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                        </svg>
                      ))}
                    </div>
                    <div className='text-sm text-gray-500'>Course Rating</div>
                  </div>
                  <svg
                    viewBox='0 0 200 80'
                    className='w-full h-23'
                  >
                    <polyline
                      points='0,60 20,45 40,50 60,35 80,40 100,30 120,45 140,35 160,50 180,40 200,45'
                      fill='none'
                      stroke='#fb923c'
                      strokeWidth='2'
                    />
                  </svg>
                </div>
                <div className='flex flex-col gap-2 p-4 pt-0'>
                  {[5, 4, 3, 2, 1].map((stars, idx) => (
                    <div
                      key={stars}
                      className='flex items-center space-x-3'
                    >
                      <div className='flex'>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < stars ? "text-orange-400" : "text-gray-300"}`}
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                        ))}
                      </div>
                      <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-orange-400 rounded-full'
                          style={{ width: `${[55, 27, 10, 5, 3][idx]}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-600 w-10 text-right'>
                        {[55, 27, 10, 5, 3][idx]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='flex-1 bg-white rounded overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold'>Course Overview</h4>
              <a
                href='#'
                className='text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
