"use client";

import { useDebounce } from "@/hooks/useDebounce.ts";
import { apiClient } from "@/lib/api/client.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Link2, Loader, Lock, Pencil, Plus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import CourseFooter from "./CourseFooter.tsx";
import {
  ChoiceDot,
  choiceCardClass,
  cx,
  Field,
  FormSection,
  inputClass,
  segmentClass,
  SelectInput,
  TextInput,
} from "./formUi.tsx";
import type { CreateCourseData } from "./page.tsx";
import StepHeader from "./StepHeader.tsx";

type BasicInfoForm = {
  title: string;
  slug: string;
  tags: string[];
  category: string;
  subCategory: string;
  language: "ENGLISH" | "BANGLA";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
};

const BasicInfoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is Required For the course")
    .min(5, "Title must be at least 5 characters long")
    .max(100, "Title cannot exceed 100 characters")
    .regex(
      /^[^<>]*$/,
      "Title contains invalid characters.Title must not contain any opening or closing HTML tags"
    ),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is Required For the course")
    .min(3, "Slug must be at least 3 characters long")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug use lowercase letters and hyphens instead of spaces, and contain no special characters."
    ),
  tags: z
    .array(z.string("Tag is required"), "Tag is required For this Course")
    .min(1, "At least one tag is required"),
  category: z.string("Category is required").min(1, "Category is required"),
  subCategory: z.string("SubCategory is required").min(1, "SubCategory is required"),
  language: z.enum(["ENGLISH", "BANGLA"], "Language is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"], "Level is required"),
});

// Same transformation the slug field already applied on blur, plus the 50-char cap.
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");

const LANGUAGES = [
  { value: "ENGLISH", label: "English" },
  { value: "BANGLA", label: "বাংলা (Bangla)" },
] as const;

const LEVELS = [
  { value: "BEGINNER", label: "Beginner", hint: "No prior experience needed" },
  { value: "INTERMEDIATE", label: "Intermediate", hint: "Comfortable with the basics" },
  { value: "ADVANCED", label: "Advanced", hint: "Has solid hands-on experience" },
  { value: "EXPERT", label: "Expert", hint: "For specialists going deeper" },
] as const;

type TagResult = { id: string; name: string; totalCourses: number };

const BasicInformaton = ({
  currentStep,
  setCurrentStep,
  courseData,
  setCourseData,
  loading,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  courseData: CreateCourseData;
  setCourseData: React.Dispatch<React.SetStateAction<CreateCourseData>>;
  loading: boolean;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [slugError, setSlugError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<TagResult[] | []>([]);

  // UI-only state
  const [autoSlug, setAutoSlug] = useState<boolean>(!courseData.slug);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const slugInputRef = useRef<HTMLInputElement | null>(null);
  const tagInputRef = useRef<HTMLInputElement | null>(null);
  const tagListId = useId();

  const checkUniqueSlug = useCallback(
    async (slug: string) => {
      if (!slug) return false;
      if (courseData.slug === slug) return true;
      try {
        const response = await apiClient.get<{ canProceed: boolean }>(`/course/slug-check/${slug}`);
        if (response.success && response.data) {
          const userData = response.data;
          if (!userData?.canProceed) {
            setSlugError("This slug is already registered. Please enter a new slug");
            return false;
          } else {
            setSlugError("");
            return true;
          }
        } else {
          return false;
        }
      } catch (_error) {
        setSlugError("Error checking slug");
        return false;
      }
    },
    [courseData.slug]
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<BasicInfoForm>({
    resolver: zodResolver(BasicInfoSchema),
    defaultValues: {
      title: courseData.title,
      slug: courseData.slug,
      tags: courseData.tags,
      category: courseData.category,
      subCategory: courseData.subCategory,
      language: courseData.language,
      level: courseData.level,
    },
  });

  useEffect(() => {
    reset({
      title: courseData.title,
      slug: courseData.slug,
      tags: courseData.tags,
      subCategory: courseData.subCategory,
      language: courseData.language,
      level: courseData.level,
    });
  }, [courseData, reset]);

  const onSubmit = useCallback(
    async (data: BasicInfoForm) => {
      const { slug, ...rest } = data;
      const isValidSlug = await checkUniqueSlug(slug);
      if (!isValidSlug) return;
      setCourseData(prev => ({
        ...prev,
        ...rest,
        slug,
      }));
      setCurrentStep(currentStep + 1);
    },
    [setCourseData, setCurrentStep, currentStep, checkUniqueSlug]
  );

  useEffect(() => {
    if (courseData.category !== "") {
      setSelectedCategory(courseData.category);
      setValue("category", courseData.category);
    }

    if (courseData.category === "" && courseData.subCategory) {
      const findCategory = courseData.allCategory.find(category =>
        category.children.some(child => child.name === courseData.subCategory)
      );
      setSelectedCategory(findCategory?.name ?? "");
      setValue("category", findCategory?.name ?? "");
    }

    if (courseData.subCategory) {
      setSelectedSubCategory(courseData.subCategory);
      setValue("subCategory", courseData.subCategory);
    }
  }, [courseData.category, courseData.subCategory, setValue, courseData.allCategory]);

  // Bug 6 fix: these now run through register()'s onChange option instead of
  // replacing react-hook-form's own onChange handler.
  // Change D: picking a new category clears a sub-category that belonged to the old one.
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCategory(e.target.value);
      setSelectedSubCategory("");
      setValue("subCategory", "", { shouldDirty: true, shouldValidate: isSubmitted });
    },
    [setValue, isSubmitted]
  );

  const handleSubCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubCategory(e.target.value);
  }, []);

  const mainCategories = () => {
    return courseData.allCategory.filter(cat => cat.parentId === null);
  };

  const subCategories = () => {
    return courseData.allCategory.find(cat => cat.name === selectedCategory)?.children ?? [];
  };

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    async function fetchTags() {
      try {
        const data = await apiClient.get<TagResult[] | []>(`/course/tags?tag=${debouncedQuery}`);
        setResults(data.data ?? []);
      } catch (_error) {
        // Suggestions are optional; typing a new tag still works.
      }
    }
    fetchTags();
  }, [debouncedQuery]);

  const tags = watch("tags") ?? [];
  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const watchedCategory = watch("category");
  const watchedSubCategory = watch("subCategory");

  const handleAddTags = (tag: string) => {
    if (!tag.trim()) return;

    if (!tags.includes(tag)) {
      setValue("tags", [...tags, tag], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleRemoveTag = (index: number) => {
    setValue(
      "tags",
      tags.filter((_, i) => i !== index),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  // ── Tag combobox (UI) ────────────────────────────────────────────────────
  const normalizedQuery = query.trim().replace(/^#+/, "").trim();
  const suggestions = useMemo(() => {
    const list: { value: string; label: string; meta?: string; isNew?: boolean }[] = [];
    const fromServer = results.filter(r => !tags.includes(r.name));
    const exactMatch = fromServer.some(r => r.name === normalizedQuery);
    if (normalizedQuery && !tags.includes(normalizedQuery) && !exactMatch) {
      list.push({ value: normalizedQuery, label: normalizedQuery, isNew: true });
    }
    fromServer.forEach(r =>
      list.push({
        value: r.name,
        label: r.name,
        meta: `${r.totalCourses} ${r.totalCourses === 1 ? "course" : "courses"}`,
      })
    );
    return list;
  }, [results, tags, normalizedQuery]);

  const commitTag = (value: string) => {
    handleAddTags(value.trim());
    setQuery("");
    setResults([]);
    setActiveSuggestion(0);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Bug 4 fix: Enter adds the tag instead of submitting the step.
    if (e.key === "Enter") {
      e.preventDefault();
      const picked = tagMenuOpen ? suggestions[activeSuggestion] : undefined;
      if (picked) commitTag(picked.value);
      else if (normalizedQuery) commitTag(normalizedQuery);
      return;
    }
    if (e.key === ",") {
      e.preventDefault();
      if (normalizedQuery) commitTag(normalizedQuery);
      return;
    }
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setTagMenuOpen(true);
      setActiveSuggestion(i => (i + 1) % suggestions.length);
      return;
    }
    if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setActiveSuggestion(i => (i - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (e.key === "Escape") {
      setTagMenuOpen(false);
      return;
    }
    if (e.key === "Backspace" && !query && tags.length) {
      handleRemoveTag(tags.length - 1);
    }
  };

  // ── Slug (UI) ────────────────────────────────────────────────────────────
  const syncSlugFromTitle = (title: string) => {
    setValue("slug", slugify(title), { shouldDirty: true, shouldValidate: isSubmitted });
    setSlugError("");
  };

  const titleField = register("title", {
    onChange: e => {
      if (autoSlug) syncSlugFromTitle(e.target.value);
    },
  });

  const slugField = register("slug", {
    onBlur: e => {
      setValue("slug", slugify(e.target.value), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    onChange: _e => {
      setSlugError("");
    },
  });

  const categoryField = register("category", { onChange: handleCategoryChange });
  const subCategoryField = register("subCategory", { onChange: handleSubCategoryChange });

  const slugCouldNotBeGenerated =
    autoSlug && (watchedTitle ?? "").trim().length > 0 && !(watchedSlug ?? "");

  if (loading) {
    return (
      <p className='flex items-center gap-3 p-8 text-sm text-gray-500'>
        <Loader className='h-5 w-5 animate-spin' /> Loading…
      </p>
    );
  }

  return (
    <div className='w-full'>
      <StepHeader
        headingText='Basics'
        description='Tell students what the course is and who it is for. You can change any of this later.'
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* ── Identity ── */}
        <FormSection
          title='Title and slug'
          description='A clear, specific title helps students find your course.'
        >
          <Field
            label='Course title'
            htmlFor='course-title'
            counter={{ value: watchedTitle?.length ?? 0, max: 100, min: 5 }}
            error={errors.title?.message}
            hint='Example: Complete Web Development with Next.js and PostgreSQL'
          >
            <TextInput
              {...titleField}
              id='course-title'
              type='text'
              value={watchedTitle}
              placeholder='What will students learn?'
              maxLength={100}
              hasError={!!errors.title}
              autoComplete='off'
            />
          </Field>

          <Field
            label='Slug'
            htmlFor='course-slug'
            counter={{ value: watchedSlug?.length ?? 0, max: 50, min: 3 }}
            error={slugError && !errors.slug ? slugError : errors.slug?.message}
            hint={
              slugCouldNotBeGenerated
                ? "We couldn't make a slug from this title. Click Edit and type one using English letters, numbers and hyphens."
                : autoSlug
                  ? "Generated from the title. Lowercase letters, numbers and hyphens only."
                  : "Lowercase letters, numbers and hyphens only. Spaces become hyphens when you leave the field."
            }
          >
            <div className='flex gap-2'>
              <div className='relative min-w-0 flex-1'>
                <Link2
                  className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
                  aria-hidden='true'
                />
                <input
                  {...slugField}
                  ref={el => {
                    slugField.ref(el);
                    slugInputRef.current = el;
                  }}
                  id='course-slug'
                  type='text'
                  value={watchedSlug}
                  readOnly={autoSlug}
                  placeholder='your-course-slug'
                  maxLength={50}
                  aria-invalid={!!(slugError || errors.slug) || undefined}
                  className={inputClass(
                    !!(slugError || errors.slug),
                    cx("pl-9 font-mono text-[13px]", autoSlug && "bg-gray-50 text-gray-600")
                  )}
                />
              </div>
              {autoSlug ? (
                <button
                  type='button'
                  onClick={() => {
                    setAutoSlug(false);
                    requestAnimationFrame(() => slugInputRef.current?.focus());
                  }}
                  className='inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-500/10'
                >
                  <Pencil
                    className='h-3.5 w-3.5'
                    aria-hidden='true'
                  />
                  Edit
                </button>
              ) : (
                <button
                  type='button'
                  onClick={() => {
                    setAutoSlug(true);
                    syncSlugFromTitle(watchedTitle ?? "");
                  }}
                  className='inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-500/10'
                  title='Generate the slug from the title again'
                >
                  <RotateCcw
                    className='h-3.5 w-3.5'
                    aria-hidden='true'
                  />
                  <span className='hidden sm:inline'>Use title</span>
                </button>
              )}
            </div>
            {autoSlug && (
              <p className='mt-1.5 flex items-center gap-1 text-xs text-gray-400'>
                <Lock
                  className='h-3 w-3'
                  aria-hidden='true'
                />
                Locked to the title
              </p>
            )}
          </Field>
        </FormSection>

        {/* ── Discoverability ── */}
        <FormSection
          title='Category and tags'
          description='Used for browsing, search and recommendations.'
        >
          <div className='grid gap-5 sm:grid-cols-2'>
            <Field
              label='Category'
              htmlFor='course-category'
              error={errors.category?.message}
            >
              <SelectInput
                {...categoryField}
                id='course-category'
                value={watchedCategory ?? ""}
                hasError={!!errors.category}
                className={!watchedCategory ? "text-gray-400" : undefined}
              >
                <option value=''>Choose a category</option>
                {mainCategories().map(value => (
                  <option
                    key={value.id}
                    value={value.name}
                  >
                    {value.name}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field
              label='Sub-category'
              htmlFor='course-subcategory'
              error={errors.subCategory?.message}
              hint={!selectedCategory ? "Choose a category first." : undefined}
            >
              <SelectInput
                {...subCategoryField}
                id='course-subcategory'
                value={watchedSubCategory ?? ""}
                disabled={!selectedCategory}
                hasError={!!errors.subCategory}
                className={!watchedSubCategory ? "text-gray-400" : undefined}
              >
                <option value=''>
                  {selectedCategory ? "Choose a sub-category" : "—"}
                </option>
                {subCategories().map(sub => (
                  <option
                    key={sub.id}
                    value={sub.name}
                  >
                    {sub.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>

          {/* Tags — change A: chip input */}
          <Field
            label='Tags'
            htmlFor='course-tags'
            error={errors.tags?.message}
            hint='Press Enter or comma to add a tag. Use words students would search for, such as "react" or "freelancing".'
          >
            <div className='relative'>
              <div
                onClick={() => tagInputRef.current?.focus()}
                className={cx(
                  "flex min-h-[44px] w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 transition-colors",
                  errors.tags
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-gray-300 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20"
                )}
              >
                {tags.map((tag, index) => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1 rounded-md bg-orange-500/10 py-1 pl-2 pr-1 text-[13px] font-medium text-orange-700'
                  >
                    <Hash
                      className='h-3 w-3 opacity-60'
                      aria-hidden='true'
                    />
                    {tag}
                    {/* Bug 3 fix: type='button' so removing a tag no longer submits the step */}
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveTag(index);
                      }}
                      aria-label={`Remove tag ${tag}`}
                      className='rounded p-0.5 hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange'
                    >
                      <X
                        className='h-3 w-3'
                        aria-hidden='true'
                      />
                    </button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  id='course-tags'
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setTagMenuOpen(true);
                    setActiveSuggestion(0);
                  }}
                  onKeyDown={handleTagKeyDown}
                  onFocus={() => setTagMenuOpen(true)}
                  onBlur={() => setTagMenuOpen(false)}
                  type='text'
                  role='combobox'
                  aria-expanded={tagMenuOpen && suggestions.length > 0}
                  aria-controls={tagListId}
                  aria-autocomplete='list'
                  placeholder={tags.length ? "Add another tag" : "Type a tag and press Enter"}
                  maxLength={50}
                  autoComplete='off'
                  className='bare-input min-w-[10rem] flex-1 border-0 bg-transparent px-1.5 py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400'
                />
              </div>

              {tagMenuOpen && suggestions.length > 0 && (
                <ul
                  id={tagListId}
                  role='listbox'
                  className='absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg sm:w-80'
                >
                  {suggestions.map((s, i) => (
                    <li
                      key={`${s.isNew ? "new" : "tag"}-${s.value}`}
                      role='option'
                      aria-selected={i === activeSuggestion}
                      onMouseDown={e => e.preventDefault()}
                      onMouseEnter={() => setActiveSuggestion(i)}
                      onClick={() => commitTag(s.value)}
                      className={cx(
                        "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                        i === activeSuggestion ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      )}
                    >
                      {s.isNew ? (
                        <Plus
                          className='h-3.5 w-3.5 text-orange'
                          aria-hidden='true'
                        />
                      ) : (
                        <Hash
                          className='h-3.5 w-3.5 text-gray-400'
                          aria-hidden='true'
                        />
                      )}
                      <span className='truncate'>
                        {s.isNew ? (
                          <>
                            Add <strong className='font-semibold'>{s.label}</strong>
                          </>
                        ) : (
                          s.label
                        )}
                      </span>
                      {s.meta && <span className='ml-auto shrink-0 text-xs text-gray-400'>{s.meta}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Field>
        </FormSection>

        {/* ── Audience ── change C */}
        <FormSection
          title='Language and level'
          description='Set expectations so the right students enrol.'
        >
          <fieldset>
            <legend className='mb-1.5 text-[13px] font-medium text-gray-800'>Teaching language</legend>
            <div className='inline-flex rounded-lg bg-gray-100 p-1'>
              {LANGUAGES.map(lang => (
                <div key={lang.value}>
                  <input
                    {...register("language")}
                    type='radio'
                    id={`lang-${lang.value}`}
                    value={lang.value}
                    className='peer sr-only'
                  />
                  <label
                    htmlFor={`lang-${lang.value}`}
                    className={segmentClass}
                  >
                    {lang.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.language && <p className='mt-1.5 text-xs text-red-600'>{errors.language.message}</p>}
          </fieldset>

          <fieldset>
            <legend className='mb-1.5 text-[13px] font-medium text-gray-800'>Course level</legend>
            <div className='grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4'>
              {LEVELS.map(level => (
                <div key={level.value}>
                  <input
                    {...register("level")}
                    type='radio'
                    id={`level-${level.value}`}
                    value={level.value}
                    className='peer sr-only'
                  />
                  <label
                    htmlFor={`level-${level.value}`}
                    className={choiceCardClass}
                  >
                    <ChoiceDot />
                    <span>
                      <span className='block text-sm font-semibold text-gray-900'>{level.label}</span>
                      <span className='mt-0.5 block text-xs leading-snug text-gray-500'>{level.hint}</span>
                    </span>
                  </label>
                </div>
              ))}
            </div>
            {errors.level && <p className='mt-1.5 text-xs text-red-600'>{errors.level.message}</p>}
          </fieldset>
        </FormSection>

        <CourseFooter
          isSubmitting={isSubmitting}
          currentStep={currentStep}
        />
      </form>
    </div>
  );
};

export default BasicInformaton;
