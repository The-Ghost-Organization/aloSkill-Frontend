"use client";
import BorderGradientButton from "@/components/buttons/BorderGradientButton.tsx";
import { motion, type Variants } from "framer-motion";
import { ArrowRightIcon, Award, BookOpen, Send, Sparkles, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GradientButton from "../../../components/buttons/GradientButton.tsx";
import { useSessionContext } from "../../contexts/SessionContext.tsx";
// import "./HeroSection.module.css";
const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
];

const features = [
  { icon: BookOpen, label: "Learn & Earn Togethe" },
  { icon: Users, label: "Industry Expert Instructors" },
  { icon: Award, label: "Start Learning & Get Certified" },
];

const stats = [
  { value: "1K+", label: "Active Learners" },
  { value: "5+", label: "Courses" },
  { value: "98%", label: "Success Rate" },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
} as const;

const floatingVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
} as const;

const scaleVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.33, 0.66, 0.66, 1],
    },
  },
} as const;

export default function HeroSection() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useSessionContext();

  const handleRegistration = () => {
    setLoading(true);
    router.push("/auth/signup");
  };

  return (
    <section className='relative w-full  min-h-screen flex items-center justify-center  pt-36 pb-10 lg:py-28 px-2 overflow-hidden'>
      {/* Animated Background Gradients */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl'
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            top: "-15%",
            left: "-10%",
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
        <motion.div
          className='absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl'
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            top: "-5%",
            right: "-10%",
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 1,
          }}
        />
        <motion.div
          className='absolute w-[550px] h-[550px] rounded-full opacity-15 blur-3xl'
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            bottom: "-15%",
            left: "20%",
          }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 2,
          }}
        />
      </div>

      {/* Floating Decorative Elements */}
      <motion.div
        className='absolute top-20 left-10 text-orange-400 opacity-20'
        variants={floatingVariants}
        animate='animate'
      >
        <Sparkles className='w-8 h-8' />
      </motion.div>
      <motion.div
        className='absolute bottom-20 right-20 text-blue-400 opacity-20'
        variants={floatingVariants}
        animate='animate'
        transition={{ delay: 1 }}
      >
        <Sparkles className='w-10 h-10' />
      </motion.div>

      {/* Grid Pattern Overlay */}
      <div
        className='absolute inset-0 opacity-[0.015]'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className='relative z-10 max-w-6xl mx-auto text-center space-y-8'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {/* Social Proof - Top */}
        <motion.div
          className='flex items-center justify-center gap-5 flex-wrap'
          variants={itemVariants}
        >
          {/* Avatars with Animation */}
          <motion.div className='flex items-center'>
            <div className='flex -space-x-3'>
              {avatars.map((avatar, index) => (
                <motion.div
                  key={index}
                  className='w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-white overflow-hidden shadow-lg cursor-pointer'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.3,
                    ease: "backOut",
                  }}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                >
                  <Image
                    src={avatar}
                    alt={`Student ${index + 1}`}
                    width={48}
                    height={48}
                    className='w-full h-full object-cover'
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Rating Badge */}
          <motion.div
            className='flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-full shadow-lg border border-yellow-200'
            variants={scaleVariants}
            whileHover='hover'
          >
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Star className='w-4 h-4 text-yellow-500 fill-yellow-500' />
              </motion.div>
            ))}
            <span className='text-sm font-bold text-gray-800 ml-2'>5.0</span>
          </motion.div>

          {/* Reviews Badge */}
          <motion.div
            className='bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-blue-200'
            variants={scaleVariants}
            whileHover='hover'
          >
            <p className='text-sm font-semibold text-gray-800'>
              <span className='text-blue-600 font-bold'>178+</span> Reviews
            </p>
          </motion.div>
        </motion.div>

        {/* Feature Badge */}
        <motion.div
          className='inline-flex items-center gap-2 bg-linear-to-r from-orange-50 to-orange-100 backdrop-blur-md px-4 py-3 rounded-full shadow-lg border border-orange-200'
          variants={itemVariants}
        >
          <motion.span
            className='w-2 h-2 bg-orange-500 rounded-full'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <p className='text-sm font-bold text-gray-800'>Learning and Reading at One Place</p>
          <Sparkles className='w-4 h-4 text-orange-500' />
        </motion.div>

        {/* Main Heading with Gradient Animation */}
        <motion.div
          className='space-y-4'
          variants={itemVariants}
        >
          <motion.h1
            className='text-4xl sm:text-6xl  font-black text-gray-900 leading-tight'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Start{" "}
            <motion.span
              className='inline-block text-transparent bg-clip-text bg-linear-to-r from-orange-dark via-orange-dark to-orange-200'
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              Learning Today
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className='text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            চাহিদাসম্পন্ন দক্ষতা অর্জন করুন এবং অসাধারণ বই আবিষ্কার করুন — সব এক প্ল্যাটফর্মে,
            বাংলায়।
          </motion.p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className='flex flex-wrap items-center justify-center gap-2 py-4'
          variants={itemVariants}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className='bg-white/80 backdrop-blur-md px-2 md:px-6 py-2 rounded-lg shadow-lg border border-gray-200'
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.p
                className='text-xl lg:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
              >
                {stat.value}
              </motion.p>
              <p className='text-sm text-gray-600 font-medium'>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Primary Action Buttons */}
        {!user ? (
          <motion.div
            className='flex flex-col sm:flex-row items-center justify-center gap-4'
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GradientButton
                icon={ArrowRightIcon}
                iconPosition='right'
                iconAnimation='slide'
                onClick={handleRegistration}
                loading={loading}
              >
                Free Registration
              </GradientButton>
            </motion.div>

            <Link href='/auth/instructor-signup'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BorderGradientButton icon={Send}>Become Instructor</BorderGradientButton>
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          !user.role.includes("INSTRUCTOR") && (
            <motion.div
              className='flex flex-col sm:flex-row items-center justify-center gap-4'
              variants={itemVariants}
            >
              <Link href='/auth/instructor-signup'>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BorderGradientButton icon={Send}>Become Instructor</BorderGradientButton>
                </motion.div>
              </Link>
            </motion.div>
          )
        )}

        {/* Features List with Icons */}
        <motion.div
          className='flex flex-wrap items-center justify-center gap-4 pt-4'
          variants={itemVariants}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className='flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-md border border-gray-200'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                >
                  <Icon className='w-5 h-5 text-orange-500' />
                </motion.div>
                <span>{feature.label}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          className='pt-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.p
            className='text-sm text-gray-500 font-medium'
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✨ Trusted by thousands of learners worldwide
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}
