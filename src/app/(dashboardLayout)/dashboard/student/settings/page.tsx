"use client";

import { apiClient } from "@/lib/api/client";
import { Eye, EyeOff, Loader2, Save, ShieldCheck, Upload, UserRound } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

type Gender = "MALE" | "FEMALE";

type StudentSettings = {
  id: string;
  email: string;
  avatarUrl: string | null;
  displayName: string;
  phoneNumber: string;
  gender: Gender;
  bio: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyProfile: StudentSettings = {
  id: "",
  email: "",
  avatarUrl: null,
  displayName: "",
  phoneNumber: "",
  gender: "MALE",
  bio: "",
};

const emptyPasswords: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState<StudentSettings>(emptyProfile);
  const [passwords, setPasswords] = useState<PasswordForm>(emptyPasswords);
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = useMemo(() => {
    const parts = profile.displayName.trim().split(/\s+/).filter(Boolean);
    return (
      parts
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join("") || "ST"
    );
  }, [profile.displayName]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    const response = await apiClient.get<StudentSettings>("/user/student/me/settings");
    if (!response.success || !response.data) {
      setError(response.message || "Unable to load your profile information.");
      setLoading(false);
      return;
    }

    setProfile(response.data);
    setLoading(false);
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const updateProfile = <K extends keyof StudentSettings>(key: K, value: StudentSettings[K]) => {
    setProfile(previous => ({ ...previous, [key]: value }));
  };

  const validateImage = (file: File): Promise<string | null> =>
    new Promise(resolve => {
      if (!file.type.startsWith("image/")) {
        resolve("Please select a valid image file.");
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        resolve("Profile image must be smaller than 4MB.");
        return;
      }

      const image = document.createElement("img");
      const url = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(url);
        if (image.naturalWidth !== image.naturalHeight) {
          resolve("Please use a square (1:1) profile image.");
          return;
        }
        resolve(null);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve("Unable to read the selected image.");
      };
      image.src = url;
    });

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
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
      const formData = new FormData();
      formData.append("file", file);
      const folder = encodeURIComponent(`students/${profile.id}/profile`);
      const response = await apiClient.postFormData<string>(
        `/course/file-upload?folder=${folder}`,
        formData
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Image upload failed.");
      }

      updateProfile("avatarUrl", response.data);
      setMessage("Photo uploaded. Save your profile to apply the change.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const saveProfile = async () => {
    setMessage("");
    setError("");

    if (profile.displayName.trim().length < 3) {
      setError("Display name must be at least 3 characters.");
      return;
    }
    if (profile.phoneNumber.trim().length < 11) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.patch<StudentSettings>("/user/student/me/settings", {
        displayName: profile.displayName.trim(),
        phoneNumber: profile.phoneNumber.trim(),
        gender: profile.gender,
        bio: profile.bio.trim() || null,
        avatarUrl: profile.avatarUrl,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Unable to update your profile.");
      }

      setProfile(response.data);
      setMessage("Your profile has been updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setMessage("");
    setError("");

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError("Please complete all password fields.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await apiClient.patch<{ changed: boolean }>("/user/student/me/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to change your password.");
      }

      setPasswords(emptyPasswords);
      setMessage("Password changed successfully.");
    } catch (passwordError) {
      setError(
        passwordError instanceof Error ? passwordError.message : "Unable to change your password."
      );
    } finally {
      setChangingPassword(false);
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
    <div className='space-y-6 pb-8'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Profile Settings</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Update the personal information used across your AloSkill student account.
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

      <section className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-100 px-5 py-4 sm:px-6'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-orange-50 p-2 text-orange-600'>
              <UserRound className='h-5 w-5' />
            </div>
            <div>
              <h2 className='font-semibold text-gray-900'>Personal information</h2>
              <p className='text-xs text-gray-500'>
                Your name, contact number, profile image and bio.
              </p>
            </div>
          </div>
        </div>

        <div className='grid gap-7 p-5 sm:p-6 lg:grid-cols-[190px_1fr]'>
          <div>
            <div className='relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-orange-50'>
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName || "Student profile"}
                  fill
                  sizes='160px'
                  className='object-cover'
                  unoptimized={profile.avatarUrl.startsWith("http")}
                />
              ) : (
                <span className='text-4xl font-bold text-orange-600'>{initials}</span>
              )}

              <button
                type='button'
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className='absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/60 px-2 py-2 text-xs font-semibold text-white hover:bg-black/70 disabled:cursor-not-allowed'
              >
                {uploading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Upload className='h-4 w-4' />
                )}
                {uploading ? "Uploading..." : "Change Photo"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/png,image/jpeg,image/webp'
              className='hidden'
              onChange={handleImageUpload}
            />
            <p className='mt-2 max-w-40 text-xs leading-5 text-gray-400'>
              Square JPG, PNG or WEBP. Maximum 4MB.
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='md:col-span-2'>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Display name</label>
              <input
                className={fieldClass}
                value={profile.displayName}
                onChange={event => updateProfile("displayName", event.target.value)}
                placeholder='Your full name'
              />
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>
                Email address
              </label>
              <input
                className={fieldClass}
                value={profile.email}
                disabled
              />
              <p className='mt-1 text-[11px] text-gray-400'>
                Account email cannot be changed here.
              </p>
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Phone number</label>
              <input
                className={fieldClass}
                value={profile.phoneNumber}
                onChange={event => updateProfile("phoneNumber", event.target.value)}
                placeholder='01XXXXXXXXX'
              />
            </div>

            <div>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>Gender</label>
              <select
                className={fieldClass}
                value={profile.gender}
                onChange={event => updateProfile("gender", event.target.value as Gender)}
              >
                <option value='MALE'>Male</option>
                <option value='FEMALE'>Female</option>
              </select>
            </div>

            <div className='md:col-span-2'>
              <div className='mb-1.5 flex items-center justify-between gap-3'>
                <label className='text-sm font-medium text-gray-700'>Short bio</label>
                <span className='text-xs text-gray-400'>{profile.bio.length}/150</span>
              </div>
              <textarea
                className={`${fieldClass} min-h-28 resize-y`}
                value={profile.bio}
                maxLength={150}
                onChange={event => updateProfile("bio", event.target.value)}
                placeholder='Write a short introduction about yourself.'
              />
            </div>

            <div className='md:col-span-2'>
              <button
                type='button'
                disabled={saving || uploading}
                onClick={() => void saveProfile()}
                className='inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {saving ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Save className='h-4 w-4' />
                )}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-100 px-5 py-4 sm:px-6'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-blue-50 p-2 text-blue-600'>
              <ShieldCheck className='h-5 w-5' />
            </div>
            <div>
              <h2 className='font-semibold text-gray-900'>Change password</h2>
              <p className='text-xs text-gray-500'>
                Use your current password before setting a new one.
              </p>
            </div>
          </div>
        </div>

        <div className='grid gap-4 p-5 sm:p-6 lg:max-w-2xl'>
          {(
            [
              ["currentPassword", "Current password", "current"],
              ["newPassword", "New password", "next"],
              ["confirmPassword", "Confirm new password", "confirm"],
            ] as const
          ).map(([key, label, visibilityKey]) => (
            <div key={key}>
              <label className='mb-1.5 block text-sm font-medium text-gray-700'>{label}</label>
              <div className='relative'>
                <input
                  className={`${fieldClass} pr-10`}
                  type={showPassword[visibilityKey] ? "text" : "password"}
                  value={passwords[key]}
                  onChange={event =>
                    setPasswords(previous => ({ ...previous, [key]: event.target.value }))
                  }
                  autoComplete={key === "currentPassword" ? "current-password" : "new-password"}
                />
                <button
                  type='button'
                  onClick={() =>
                    setShowPassword(previous => ({
                      ...previous,
                      [visibilityKey]: !previous[visibilityKey],
                    }))
                  }
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700'
                  aria-label={`Toggle ${label.toLowerCase()} visibility`}
                >
                  {showPassword[visibilityKey] ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
          ))}

          <p className='text-xs leading-5 text-gray-400'>
            Use at least 8 characters with an uppercase letter, lowercase letter and number.
          </p>

          <div>
            <button
              type='button'
              disabled={changingPassword}
              onClick={() => void changePassword()}
              className='inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {changingPassword && <Loader2 className='h-4 w-4 animate-spin' />}
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
