"use client";

import { apiClient } from "@/lib/api/client";
import { Globe2, Loader2, Save, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";

type SocialPlatform = "FACEBOOK" | "TWITTER" | "INSTAGRAM" | "LINKEDIN" | "YOUTUBE";

type InstructorSettings = {
  id: string;
  email: string;
  avatarUrl: string | null;
  displayName: string;
  phoneNumber: string;
  expertise: string | null;
  bio: string;
  website: string | null;
  qualifications: string;
  currentOrg: string | null;
  experience: number;
  address: string;
  city: string;
  nationality: string;
  socialAccounts: Array<{ platform: SocialPlatform; url: string }>;
};

type FormState = Omit<InstructorSettings, "id" | "socialAccounts"> & {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
};

const emptyForm: FormState = {
  email: "",
  avatarUrl: null,
  displayName: "",
  phoneNumber: "",
  expertise: "",
  bio: "",
  website: "",
  qualifications: "",
  currentOrg: "",
  experience: 0,
  address: "",
  city: "",
  nationality: "",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  youtube: "",
};

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";

function socialValue(accounts: InstructorSettings["socialAccounts"], platform: SocialPlatform) {
  return accounts.find(account => account.platform === platform)?.url ?? "";
}

function normalizeOptionalUrl(value: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export default function AccountSettings() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const avatarSrc = useMemo(() => form.avatarUrl || "/images/default-avatar.png", [form.avatarUrl]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const response = await apiClient.get<InstructorSettings>("/user/instructor/me/settings");

      if (!mounted) return;

      if (!response.success || !response.data) {
        setError(response.message || "Unable to load your instructor profile.");
        setLoading(false);
        return;
      }

      const data = response.data;
      setForm({
        email: data.email,
        avatarUrl: data.avatarUrl,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        expertise: data.expertise ?? "",
        bio: data.bio,
        website: data.website ?? "",
        qualifications: data.qualifications,
        currentOrg: data.currentOrg ?? "",
        experience: data.experience,
        address: data.address,
        city: data.city,
        nationality: data.nationality,
        facebook: socialValue(data.socialAccounts, "FACEBOOK"),
        twitter: socialValue(data.socialAccounts, "TWITTER"),
        instagram: socialValue(data.socialAccounts, "INSTAGRAM"),
        linkedin: socialValue(data.socialAccounts, "LINKEDIN"),
        youtube: socialValue(data.socialAccounts, "YOUTUBE"),
      });
      setLoading(false);
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const validateImage = (file: File): Promise<string | null> =>
    new Promise(resolve => {
      if (!file.type.startsWith("image/")) {
        resolve("Please select an image file.");
        return;
      }
      if (file.size > 1024 * 1024) {
        resolve("Profile image must be under 1MB.");
        return;
      }

      const img = document.createElement("img");
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.naturalWidth !== img.naturalHeight) {
          resolve("Profile image must use a 1:1 ratio.");
          return;
        }
        resolve(null);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve("Unable to read the selected image.");
      };
      img.src = url;
    });

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("");
    setError("");

    const validationError = await validateImage(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const folder = encodeURIComponent(`${form.email}/profile`);
      const response = await apiClient.postFormData<string>(
        `/course/instructor-file-upload?folder=${folder}`,
        uploadData
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Image upload failed.");
      }

      updateField("avatarUrl", response.data);
      setMessage("Photo uploaded. Click Save Changes to update your profile.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const saveChanges = async () => {
    setMessage("");
    setError("");

    if (form.displayName.trim().length < 3) {
      setError("Display name must be at least 3 characters.");
      return;
    }
    if (form.phoneNumber.trim().length < 11) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (form.bio.trim().length < 10) {
      setError("Biography must be at least 10 characters.");
      return;
    }

    const socialAccounts = [
      ["FACEBOOK", form.facebook],
      ["TWITTER", form.twitter],
      ["INSTAGRAM", form.instagram],
      ["LINKEDIN", form.linkedin],
      ["YOUTUBE", form.youtube],
    ]
      .filter(([, url]) => String(url).trim().length > 0)
      .map(([platform, url]) => ({
        platform: platform as SocialPlatform,
        url: String(url).trim(),
      }));

    setSaving(true);
    try {
      const response = await apiClient.patch<InstructorSettings>("/user/instructor/me/settings", {
        displayName: form.displayName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        expertise: form.expertise?.trim(),
        bio: form.bio.trim(),
        website: normalizeOptionalUrl(form.website),
        avatarUrl: form.avatarUrl,
        qualifications: form.qualifications.trim(),
        currentOrg: form.currentOrg?.trim(),
        experience: Number(form.experience) || 0,
        address: form.address.trim(),
        city: form.city.trim(),
        nationality: form.nationality.trim(),
        socialAccounts,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to update your profile.");
      }

      setMessage("Your instructor profile has been updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-[420px] items-center justify-center rounded-xl bg-white'>
        <Loader2 className='h-7 w-7 animate-spin text-orange-500' />
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-4 pb-8'>
      <div>
        <h1 className='text-xl font-bold text-gray-900'>Instructor Settings</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Keep your public instructor and linked author information up to date.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className='rounded-xl bg-white p-4 sm:p-5'>
        <div className='mb-5'>
          <h2 className='font-semibold text-gray-900'>Account Settings</h2>
          <p className='mt-1 text-xs text-gray-500'>
            Information visible on your instructor profile.
          </p>
        </div>

        <div className='grid gap-6 lg:grid-cols-[180px_1fr]'>
          <div>
            <div className='relative h-40 w-40 overflow-hidden rounded-xl border border-gray-200 bg-gray-100'>
              <Image
                src={avatarSrc}
                alt={form.displayName || "Instructor profile"}
                fill
                sizes='160px'
                className='object-cover'
                unoptimized={avatarSrc.startsWith("http")}
              />
              <button
                type='button'
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className='absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/55 px-2 py-2 text-xs font-medium text-white transition hover:bg-black/70 disabled:cursor-not-allowed'
              >
                {uploading ? (
                  <Loader2
                    size={15}
                    className='animate-spin'
                  />
                ) : (
                  <Upload size={15} />
                )}
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
            <input
              ref={inputRef}
              type='file'
              accept='image/png,image/jpeg,image/webp'
              onChange={handleImage}
              className='hidden'
            />
            <p className='mt-2 max-w-40 text-[11px] leading-4 text-gray-400'>
              JPG, PNG or WebP. Under 1MB with a 1:1 ratio.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Field label='Display Name'>
              <input
                className={fieldClass}
                value={form.displayName}
                onChange={e => updateField("displayName", e.target.value)}
                maxLength={60}
              />
            </Field>
            <Field label='Email'>
              <input
                className={`${fieldClass} cursor-not-allowed text-gray-400`}
                value={form.email}
                disabled
              />
            </Field>
            <Field label='Phone Number'>
              <input
                className={fieldClass}
                value={form.phoneNumber}
                onChange={e => updateField("phoneNumber", e.target.value)}
                maxLength={14}
              />
            </Field>
            <Field label='Title / Expertise'>
              <input
                className={fieldClass}
                value={form.expertise ?? ""}
                onChange={e => updateField("expertise", e.target.value)}
                maxLength={100}
                placeholder='e.g. Digital Marketing Specialist'
              />
            </Field>
            <Field label='Nationality'>
              <input
                className={fieldClass}
                value={form.nationality}
                onChange={e => updateField("nationality", e.target.value)}
              />
            </Field>
            <Field label='City'>
              <input
                className={fieldClass}
                value={form.city}
                onChange={e => updateField("city", e.target.value)}
              />
            </Field>
            <div className='sm:col-span-2'>
              <Field label='Address'>
                <input
                  className={fieldClass}
                  value={form.address}
                  onChange={e => updateField("address", e.target.value)}
                />
              </Field>
            </div>
            <div className='sm:col-span-2'>
              <Field label='Biography'>
                <textarea
                  className={`${fieldClass} min-h-28 resize-y`}
                  value={form.bio}
                  onChange={e => updateField("bio", e.target.value)}
                  maxLength={4000}
                />
                <p className='mt-1 text-right text-[11px] text-gray-400'>{form.bio.length}/4000</p>
              </Field>
            </div>
          </div>
        </div>
      </section>

      <section className='rounded-xl bg-white p-4 sm:p-5'>
        <h2 className='font-semibold text-gray-900'>Professional Information</h2>
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field label='Qualifications'>
            <input
              className={fieldClass}
              value={form.qualifications}
              onChange={e => updateField("qualifications", e.target.value)}
            />
          </Field>
          <Field label='Current Organization'>
            <input
              className={fieldClass}
              value={form.currentOrg ?? ""}
              onChange={e => updateField("currentOrg", e.target.value)}
            />
          </Field>
          <Field label='Experience (years)'>
            <input
              type='number'
              min={0}
              max={50}
              className={fieldClass}
              value={form.experience}
              onChange={e => updateField("experience", Number(e.target.value))}
            />
          </Field>
          <Field label='Personal Website'>
            <div className='relative'>
              <Globe2 className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='url'
                className={`${fieldClass} pl-9`}
                value={form.website ?? ""}
                onChange={e => updateField("website", e.target.value)}
                placeholder='https://example.com'
              />
            </div>
          </Field>
        </div>
      </section>

      <section className='rounded-xl bg-white p-4 sm:p-5'>
        <h2 className='font-semibold text-gray-900'>Social Profile</h2>
        <p className='mt-1 text-xs text-gray-500'>Use full profile URLs including https://</p>
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <SocialField
            label='Facebook'
            value={form.facebook}
            onChange={value => updateField("facebook", value)}
          />
          <SocialField
            label='Instagram'
            value={form.instagram}
            onChange={value => updateField("instagram", value)}
          />
          <SocialField
            label='Twitter / X'
            value={form.twitter}
            onChange={value => updateField("twitter", value)}
          />
          <SocialField
            label='LinkedIn'
            value={form.linkedin}
            onChange={value => updateField("linkedin", value)}
          />
          <SocialField
            label='YouTube'
            value={form.youtube}
            onChange={value => updateField("youtube", value)}
          />
        </div>
      </section>

      <div className='flex justify-end'>
        <button
          type='button'
          disabled={saving || uploading}
          onClick={saveChanges}
          className='inline-flex items-center gap-2 rounded-lg bg-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-light disabled:cursor-not-allowed disabled:opacity-60'
        >
          {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className='block'>
      <span className='mb-1.5 block text-xs font-semibold text-gray-600'>{label}</span>
      {children}
    </label>
  );
}

function SocialField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type='url'
        className={fieldClass}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder='https://...'
      />
    </Field>
  );
}
