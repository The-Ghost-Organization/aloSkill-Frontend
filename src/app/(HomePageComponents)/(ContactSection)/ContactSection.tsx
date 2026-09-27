"use client";

import GradientButton from "@/components/buttons/GradientButton";
import { PageHeading } from "@/components/shared/PageHeading";
import { API_ENDPOINTS, apiClient } from "@/lib/api/client";
import type { ContactFormData } from "@/lib/schema-validations/contact.schema";
import { contactFormSchema } from "@/lib/schema-validations/contact.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const SUPPORT_EMAIL = "info@aloskill.com";
const SUPPORT_PHONE_DISPLAY = "+880 1658-654528";
const SUPPORT_PHONE_HREF = "tel:+8801658654528";

type ContactFormValues = Omit<ContactFormData, "website"> & {
  website: string;
};

export default function ContactSection() {
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema) as any,
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitStatus({ type: null, message: "" });

    const response = await apiClient.post(API_ENDPOINTS.CONTACT.SUBMIT, data);

    if (!response.success) {
      setSubmitStatus({
        type: "error",
        message:
          response.message ||
          "We could not send your message right now. Please try again or contact us directly.",
      });
      return;
    }

    setSubmitStatus({
      type: "success",
      message: "Thanks! Your message has been received. Our team will get back to you soon.",
    });
    reset();
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
    }`;

  return (
    <section
      id='contact'
      className='relative overflow-hidden py-16 md:py-24'
      aria-labelledby='contact-heading'
    >
      <div
        className='absolute inset-0 opacity-60'
        aria-hidden='true'
        style={{
          background:
            "linear-gradient(135deg, rgba(255,247,237,.9) 0%, rgba(255,255,255,1) 48%, rgba(254,242,242,.7) 100%)",
        }}
      />
      <div
        className='absolute -right-20 top-16 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl'
        aria-hidden='true'
      />
      <div
        className='absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl'
        aria-hidden='true'
      />

      <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div
          id='contact-heading'
          className='mb-12 text-center'
        >
          <PageHeading
            badge='Contact AloSkill'
            badgeIcon={Sparkles}
            title='How Can We Help'
            titleHighlight='You?'
            subtitle='Questions about a course, book order, instructor account, partnership, or anything else? Send us a message and our team will point you in the right direction.'
          />
        </div>

        <div className='grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,.8fr)]'>
          <div className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/40 sm:p-8 lg:p-10'>
            <div className='mb-8 flex items-start gap-4'>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DA7C36] text-white shadow-lg shadow-orange-200'>
                <MessageCircle className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-xl font-bold text-slate-950'>Send us a message</h3>
                <p className='mt-1 text-sm leading-6 text-slate-500'>
                  Share enough detail for us to route your request to the right person.
                </p>
              </div>
            </div>

            {submitStatus.type && (
              <div
                role={submitStatus.type === "error" ? "alert" : "status"}
                aria-live='polite'
                className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
                  submitStatus.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0' />
                ) : (
                  <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
                )}
                <p className='text-sm font-medium leading-6'>{submitStatus.message}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-5'
              noValidate
            >
              <div
                className='absolute left-[-9999px] top-auto h-px w-px overflow-hidden'
                aria-hidden='true'
              >
                <label htmlFor='contact-website'>Website</label>
                <input
                  id='contact-website'
                  type='text'
                  tabIndex={-1}
                  autoComplete='off'
                  {...register("website")}
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <label
                    htmlFor='firstName'
                    className='mb-2 block text-sm font-semibold text-slate-700'
                  >
                    First name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    id='firstName'
                    type='text'
                    autoComplete='given-name'
                    placeholder='Your first name'
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                    className={inputClass(Boolean(errors.firstName))}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p
                      id='firstName-error'
                      className='mt-1.5 text-xs font-medium text-red-600'
                    >
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='lastName'
                    className='mb-2 block text-sm font-semibold text-slate-700'
                  >
                    Last name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    id='lastName'
                    type='text'
                    autoComplete='family-name'
                    placeholder='Your last name'
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                    className={inputClass(Boolean(errors.lastName))}
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p
                      id='lastName-error'
                      className='mt-1.5 text-xs font-medium text-red-600'
                    >
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='mb-2 block text-sm font-semibold text-slate-700'
                >
                  Email address <span className='text-red-500'>*</span>
                </label>
                <input
                  id='email'
                  type='email'
                  autoComplete='email'
                  inputMode='email'
                  placeholder='you@example.com'
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={inputClass(Boolean(errors.email))}
                  {...register("email")}
                />
                {errors.email && (
                  <p
                    id='email-error'
                    className='mt-1.5 text-xs font-medium text-red-600'
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='subject'
                  className='mb-2 block text-sm font-semibold text-slate-700'
                >
                  Subject <span className='text-red-500'>*</span>
                </label>
                <input
                  id='subject'
                  type='text'
                  placeholder='e.g. Course support, book order, partnership'
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? "subject-error" : undefined}
                  className={inputClass(Boolean(errors.subject))}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p
                    id='subject-error'
                    className='mt-1.5 text-xs font-medium text-red-600'
                  >
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <div className='mb-2 flex items-center justify-between gap-3'>
                  <label
                    htmlFor='message'
                    className='text-sm font-semibold text-slate-700'
                  >
                    Message <span className='text-red-500'>*</span>
                  </label>
                  <span className='text-xs text-slate-400'>20–3000 characters</span>
                </div>
                <textarea
                  id='message'
                  rows={6}
                  placeholder='Tell us what you need help with...'
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={`${inputClass(Boolean(errors.message))} resize-y`}
                  {...register("message")}
                />
                {errors.message && (
                  <p
                    id='message-error'
                    className='mt-1.5 text-xs font-medium text-red-600'
                  >
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between'>
                <p className='flex items-center gap-2 text-xs leading-5 text-slate-500'>
                  <ShieldCheck className='h-4 w-4 shrink-0 text-emerald-600' />
                  Your contact details are used only to respond to this request.
                </p>
                <GradientButton
                  type='submit'
                  icon={Send}
                  iconPosition='right'
                  loading={isSubmitting}
                  loadingText='Sending...'
                  disabled={isSubmitting}
                  className='w-full sm:w-auto'
                >
                  Send Message
                </GradientButton>
              </div>
            </form>
          </div>

          <aside className='space-y-5'>
            <div className='rounded-2xl bg-gradient-to-br from-[#DA7C36] to-[#C86624] p-7 text-white shadow-xl shadow-orange-200/50'>
              <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur'>
                <Phone className='h-6 w-6' />
              </div>
              <h3 className='text-xl font-bold'>Prefer to talk?</h3>
              <p className='mt-2 text-sm leading-6 text-white/85'>
                Call our team for general support, course questions, or book-order assistance.
              </p>
              <a
                href={SUPPORT_PHONE_HREF}
                className='mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#C86624] transition hover:-translate-y-0.5 hover:bg-orange-50'
              >
                <Phone className='h-4 w-4' />
                {SUPPORT_PHONE_DISPLAY}
              </a>
            </div>

            <div className='rounded-2xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/40'>
              <div className='mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#DA7C36]'>
                <Mail className='h-6 w-6' />
              </div>
              <h3 className='text-lg font-bold text-slate-950'>Email us directly</h3>
              <p className='mt-2 text-sm leading-6 text-slate-500'>
                If you already have screenshots, invoices, or detailed information, email is a good
                option.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className='mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#DA7C36] transition hover:text-[#B85D1D]'
              >
                {SUPPORT_EMAIL}
                <Send className='h-4 w-4' />
              </a>
            </div>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-1'>
              <div className='flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5'>
                <Clock3 className='mt-0.5 h-5 w-5 shrink-0 text-[#DA7C36]' />
                <div>
                  <p className='text-sm font-bold text-slate-900'>Response time</p>
                  <p className='mt-1 text-xs leading-5 text-slate-500'>
                    We aim to respond within one business day.
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5'>
                <ShieldCheck className='mt-0.5 h-5 w-5 shrink-0 text-emerald-600' />
                <div>
                  <p className='text-sm font-bold text-slate-900'>Safer support</p>
                  <p className='mt-1 text-xs leading-5 text-slate-500'>
                    Never send passwords, OTPs, or payment credentials.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
