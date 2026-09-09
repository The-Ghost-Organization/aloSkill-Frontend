import { BookOpen, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import type { DashboardDataType } from "../../../(withoutSidebarLayout)/courses/allCourses.types";
import { apiClient } from "../../../../lib/api/client";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const getDashboardData = async () => {
    const fetchData = await apiClient.get<DashboardDataType>(
      `/course/instructorDashboard?userId=${user?.id}`,
      { Authorization: `Bearer ${session?.accessToken}` }
    );
    if (!fetchData.success) {
      return null;
    }
    return fetchData;
  };

  const data = await getDashboardData();

  if (!data) {
    return (
      <div className='w-full flex items-center justify-center h-64'>
        <p className='text-gray-500 text-sm'>Failed to load dashboard data.</p>
      </div>
    );
  }

  // Mock data
  const stats = [
    {
      label: "Total Courses",
      value: data?.data?.counters.totalCourses,
      icon: BookOpen,
      color: "bg-orange-100",
      iconColor: "text-orange-500",
    },
    {
      label: "Total Students",
      value: data?.data?.counters.totalStudents,
      icon: Users,
      color: "bg-purple-100",
      iconColor: "text-purple-500",
    },
    {
      label: "Total Instructors",
      value: data?.data?.counters.totalOtherInstructors,
      icon: Users,
      color: "bg-orange-100",
      iconColor: "text-orange-500",
    },
    {
      label: "Total Enrolled",
      value: data?.data?.counters.totalEnrolled,
      icon: BookOpen,
      color: "bg-green-100",
      iconColor: "text-green-500",
    },
    // {
    //   label: "Total Courses",
    //   value: "357",
    //   icon: BookOpen,
    //   color: "bg-orange-100",
    //   iconColor: "text-orange-500",
    // },
    // {
    //   label: "Total Students",
    //   value: "19",
    //   icon: Users,
    //   color: "bg-purple-100",
    //   iconColor: "text-purple-500",
    // },
    // {
    //   label: "Total Instructors",
    //   value: "241",
    //   icon: Users,
    //   color: "bg-orange-100",
    //   iconColor: "text-orange-500",
    // },
    // {
    //   label: "Total Enrolled",
    //   value: "955",
    //   icon: BookOpen,
    //   color: "bg-green-100",
    //   iconColor: "text-green-500",
    // },
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

  return (
    <div className='w-full'>
      <div className='flex flex-col gap-4 overflow-auto'>
        {/* Stats Grid */}
        <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className='bg-white rounded px-3 py-2 flex items-center gap-3'
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
              </div>

              <div>
                <div className='text-lg sm:text-xl font-bold text-gray-800'>{stat.value}</div>
                <div className='text-xs sm:text-sm text-gray-500'>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Progress Section */}
        {/* <div className='bg-linear-to-r from-[#0F172A] to-[#0B1120] rounded p-4 sm:p-5 text-white'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>


            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white overflow-hidden'>
                <div className='w-full h-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center'>
                  <span className='text-white font-bold text-lg sm:text-xl'>VS</span>
                </div>
              </div>
              <div>
                <h3 className='text-lg sm:text-xl font-semibold'>Valio Shirdi</h3>
                <p className='text-indigo-200 text-xs sm:text-sm'>UX Designer</p>
              </div>
            </div>


            <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 w-full lg:w-auto'>
              <div className='flex items-center gap-3 sm:gap-5 flex-1'>
                <div className='text-xs sm:text-sm text-indigo-200'>1/4 Steps</div>
                <div className='w-full sm:w-56 h-2.5 bg-[#172b5d] overflow-hidden rounded'>
                  <div
                    className='h-full bg-linear-to-r from-green-400 to-green-500'
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>

              <div className='text-xs sm:text-sm text-indigo-200'>30% Completed</div>

              <Link href='/dashboard/instructor/settings'>
                <button className='px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 rounded font-medium transition-colors text-xs sm:text-sm'>
                  Edit Biography
                </button>
              </Link>
            </div>
          </div>
        </div> */}

        {/* Bottom Section */}
        <div className='w-full flex flex-col lg:flex-row gap-3'>
          {/* Recent Activity */}
          <div className='bg-white rounded w-full lg:w-[30%] max-h-[400px] overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold text-sm sm:text-base'>Recent Activity</h4>
              <a
                href='#'
                className='text-xs sm:text-sm text-orange-500 hover:text-orange-600'
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
                  <div className={`w-3.5 h-3.5 ${activity.color} rounded-full mt-1`}></div>
                  <div className='flex-1 flex flex-col gap-1'>
                    <p className='text-xs sm:text-sm font-medium text-gray-800'>
                      {activity.action}
                    </p>
                    <p className='text-xs text-gray-500'>{activity.detail}</p>
                    <p className='text-xs text-gray-400'>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className='bg-white rounded flex-1 max-h-[400px] overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold text-sm sm:text-base'>Reviews</h4>
              <a
                href='#'
                className='text-xs sm:text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>
          </div>

          {/* Profile View */}
          <div className='bg-white rounded w-full lg:w-[25%] max-h-[400px] overflow-y-auto'>
            <div className='flex items-center justify-between border-b border-gray-200 p-4'>
              <h4 className='font-semibold text-sm sm:text-base'>Profile View</h4>
              <a
                href='#'
                className='text-xs sm:text-sm text-orange-500 hover:text-orange-600'
              >
                Today →
              </a>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className='w-full flex flex-col lg:flex-row gap-3 mb-4'>
          {/* Ratings */}
          <div className='bg-white rounded w-full lg:w-[40%] max-h-[400px] overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold text-sm sm:text-base'>Overall Course Ratings</h4>
              <a
                href='#'
                className='text-xs sm:text-sm text-orange-500 hover:text-orange-600'
              >
                See more →
              </a>
            </div>

            <div className='flex flex-col gap-4 p-4'>
              <div className='flex flex-col sm:flex-row items-center gap-4 border-b border-gray-200 pb-4'>
                <div className='flex flex-col items-center justify-center bg-[#FFF2E5] w-32 sm:w-[40%] aspect-square rounded'>
                  <div className='text-2xl sm:text-3xl font-bold text-gray-800'>4.6</div>
                  <div className='text-xs sm:text-sm text-gray-500'>Course Rating</div>
                </div>

                <svg
                  viewBox='0 0 200 80'
                  className='w-full h-20'
                >
                  <polyline
                    points='0,60 20,45 40,50 60,35 80,40 100,30 120,45 140,35 160,50 180,40 200,45'
                    fill='none'
                    stroke='#fb923c'
                    strokeWidth='2'
                  />
                </svg>
              </div>

              {[5, 4, 3, 2, 1].map((stars, idx) => (
                <div
                  key={stars}
                  className='flex items-center gap-2 sm:gap-3'
                >
                  <div className='flex'>
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${
                          i < stars ? "text-orange-400" : "text-gray-300"
                        }`}
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

                  <span className='text-xs sm:text-sm text-gray-600 w-10 text-right'>
                    {[55, 27, 10, 5, 3][idx]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Overview */}
          <div className='flex-1 bg-white rounded max-h-[400px] overflow-y-auto'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h4 className='font-semibold text-sm sm:text-base'>Course Overview</h4>
              <a
                href='#'
                className='text-xs sm:text-sm text-orange-500 hover:text-orange-600'
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
