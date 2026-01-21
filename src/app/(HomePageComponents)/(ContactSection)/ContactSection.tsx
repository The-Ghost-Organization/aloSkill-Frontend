"use client";

import GradientButton from "@/components/buttons/GradientButton";
import { PageHeading } from "@/components/shared/PageHeading";
import type { ContactFormData } from "@/lib/schema-validations/contact.schema.ts";
import { contactFormSchema } from "@/lib/schema-validations/contact.schema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur", // Validate on blur for better UX
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      // Success
      setSubmitStatus({
        type: "success",
        message: "Message sent successfully! We'll get back to you within 24 hours.",
      });
      reset(); // Clear form

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
    } catch (error) {
      // console.error("Form submission error:", error);
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='relative py-20 md:py-32 overflow-hidden'>
      {/* Gradient Background */}
      <div
        className='absolute inset-0 opacity-40'
        style={{
          background: `linear-gradient(135deg, rgba(91, 97, 255, 0.2) 0%, rgba(255, 187, 248, 0.5) 30%, rgba(250, 255, 189, 0.3) 60%, rgba(234, 255, 255, 1) 100%)`,
        }}
      />

      {/* Decorative Elements */}
      <div className='absolute top-20 right-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-20' />
      <div className='absolute bottom-20 left-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header with Floating Badge */}
        <div className='text-center mb-16'>
          <PageHeading
            badge='Lets Connect'
            badgeIcon={Sparkles}
            title='Get Your Free '
            titleHighlight='Consultation Today'
            subtitle='Transform your HR processes with our innovative solutions. Lets discuss how we can help your team thrive.'
          />
        </div>

        {/* New Layout: Bento Grid Style */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Large Form Card - Spans 2 columns */}
          <div className='lg:col-span-2 bg-white rounded-lg p-8 md:p-10 shadow-2xl border border-gray-100'>
            <div className='flex items-center gap-3 mb-8'>
              <div
                className='w-10 h-10 rounded-lg flex items-center justify-center shadow-lg'
                style={{ backgroundColor: "#da7c36" }}
              >
                <MessageCircle className='w-4 h-4 text-white' />
              </div>
              <div>
                <h3 className='text-xl font-bold'>Drop us a message</h3>
                <p className='text-sm md:text-md text-gray-500'>
                  We will get back to you within 24 hours
                </p>
              </div>
            </div>

            {/* Status Messages */}
            {submitStatus.type && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  submitStatus.type === "success"
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-red-50 border-2 border-red-200"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle2 className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                ) : (
                  <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                )}
                <p
                  className={`text-sm font-medium ${
                    submitStatus.type === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {submitStatus.message}
                </p>
              </div>
            )}

            <div className='space-y-6'>
              {/* Name Fields */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='group'>
                  <label
                    htmlFor='firstName'
                    className='block text-sm font-semibold text-gray-700 mb-2'
                  >
                    First Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='firstName'
                    {...register("firstName")}
                    placeholder='John'
                    className={`w-full px-5 py-2 bg-gray-50 border-2 rounded-lg focus:outline-none focus:bg-white transition-all duration-300 ${
                      errors.firstName
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-orange-400"
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <p className='mt-1.5 text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-4 h-4' />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className='group'>
                  <label
                    htmlFor='lastName'
                    className='block text-sm font-semibold text-gray-700 mb-2'
                  >
                    Last Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    id='lastName'
                    {...register("lastName")}
                    placeholder='Doe'
                    className={`w-full px-5 py-2 bg-gray-50 border-2 rounded-lg focus:outline-none focus:bg-white transition-all duration-300 ${
                      errors.lastName
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-200 focus:border-orange-400"
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <p className='mt-1.5 text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-4 h-4' />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Email Address <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  id='email'
                  {...register("email")}
                  placeholder='john.doe@company.com'
                  className={`w-full px-5 py-2 bg-gray-50 border-2 rounded-lg focus:outline-none focus:bg-white transition-all duration-300 ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-orange-400"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className='mt-1.5 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor='subject'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Subject <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='subject'
                  {...register("subject")}
                  placeholder='How can we help you?'
                  className={`w-full px-5 py-2 bg-gray-50 border-2 rounded-lg focus:outline-none focus:bg-white transition-all duration-300 ${
                    errors.subject
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-orange-400"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.subject && (
                  <p className='mt-1.5 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor='message'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Message <span className='text-red-500'>*</span>
                </label>
                <textarea
                  id='message'
                  {...register("message")}
                  placeholder='Tell us about your needs...'
                  rows={4}
                  className={`w-full px-5 py-2 bg-gray-50 border-2 rounded-lg focus:outline-none focus:bg-white transition-all duration-300 resize-none ${
                    errors.message
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-orange-400"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className='mt-1.5 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <GradientButton
                onClick={handleSubmit(onSubmit)}
                className='w-full'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg
                      className='animate-spin h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </GradientButton>
            </div>
          </div>

          {/* Right Column - Stacked Action Cards */}
          <div className='space-y-6'>
            {/* Phone Card */}
            <div
              className='relative rounded-lg p-8 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2'
              style={{ backgroundColor: "#da7c36" }}
            >
              <div
                className='absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20'
                style={{ backgroundColor: "#fc9759" }}
              />

              <div className='relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                <Phone className='w-8 h-8 text-white' />
              </div>

              <h3 className='text-xl font-bold text-white mb-3'>Talk to Sales</h3>
              <p className='text-white/90 text-sm mb-6 leading-relaxed'>
                Schedule a call with our experts to discuss your specific needs.
              </p>
              <button className='px-6 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-50 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl'>
                Book Now
              </button>
            </div>

            {/* Email Card */}
            <div
              className='relative rounded-lg p-8 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2'
              style={{
                background: "linear-gradient(135deg, #fc9759 0%, #da7c36 100%)",
              }}
            >
              <div
                className='absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20'
                style={{ backgroundColor: "#d15100" }}
              />

              <div className='relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                <Send className='w-8 h-8 text-white' />
              </div>

              <h3 className='text-xl font-bold text-white mb-3'>Email Us</h3>
              <p className='text-white/90 text-sm mb-6 leading-relaxed'>
                Prefer email? Drop us a line and we will respond promptly.
              </p>
              <button className='px-6 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-50 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl'>
                Send Email
              </button>
            </div>

            {/* Info Badge */}
            <div className='bg-white rounded-lg p-6 shadow-lg border-2 border-gray-100'>
              <div className='flex items-start gap-4'>
                <div
                  className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0'
                  style={{ backgroundColor: "#da7c36" }}
                >
                  <Sparkles className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h4 className='font-bold text-gray-900 mb-1'>Quick Response</h4>
                  <p className='text-sm text-gray-600'>
                    Average response time:{" "}
                    <span className='font-semibold text-orange-600'>2 hours</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
