"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Building,
  DollarSign,
  Eye,
  FileText,
  Hash,
  ImageIcon,
  Info,
  Languages,
  Loader,
  PenTool,
  Save,
  Search,
  Tag,
  Upload,
  User,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { apiClient } from "../../../../../../lib/api/client";
import { useSessionContext } from "../../../../../contexts/SessionContext";
import { type BookEditData } from "../books.types";

const PdfPreviewModal = dynamic(() => import("./PdfPreviewModal"), {
  ssr: false,
});

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const bookSchema = z
  .object({
    title: z
      .string()
      .min(1, "Book title is required")
      .regex(/^[^<>]*$/, "Title must not contain any opening or closing HTML tags"),
    author: z
      .string()
      .min(1, "Author name is required")
      .regex(/^[^<>]*$/, "Author name must not contain any opening or closing HTML tags"),
    translator: z
      .string()
      .regex(/^[^<>]*$/, "Translator name must not contain any opening or closing HTML tags")
      .optional(),
    editor: z
      .string()
      .regex(/^[^<>]*$/, "Editor name must not contain any opening or closing HTML tags")
      .optional(),
    publisher: z
      .string()
      .min(1, "Publisher is required")
      .regex(/^[^<>]*$/, "Publisher name must not contain any opening or closing HTML tags"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .regex(/^[^<>]*$/, "Description must not contain any opening or closing HTML tags"),

    regularPrice: z.coerce.number().min(0, "Price cannot be negative"),
    salePrice: z.coerce.number().min(0, "Price cannot be negative"),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),

    isbn: z
      .string()
      .regex(/^[^<>]*$/, "ISBN must not contain any opening or closing HTML tags")
      .optional(),
    edition: z
      .string()
      .regex(/^[^<>]*$/, "Edition must not contain any opening or closing HTML tags")
      .optional(),
    pages: z.coerce
      .number()
      .int()
      .positive("Pages must not contain any negative numbers")
      .optional(),
    language: z.string().min(1, "Language is required"),

    category: z.string().min(1, "Category is required"),
    formats: z.array(z.string()).min(1, "Select at least one format"),

    metaKeywords: z
      .string()
      .regex(/^[^<>]*$/, "Objectives must not contain any opening or closing HTML tags")
      .optional(),
    metaDescription: z
      .string()
      .regex(/^[^<>]*$/, "Meta description must not contain any opening or closing HTML tags")
      .optional(),
    coverImageUrl: z.url("Cover Image url must be a valid URL"),
    files: z.array(
      z.object({
        name: z
          .string()
          .regex(/^[^<>]*$/, "File names must not contain any opening or closing HTML tags"),
        url: z.url("File url must be a valid URL"),
        fileType: z.enum(["PREVIEW", "EBOOK"]),
      })
    ),
    coverImage: z.custom<File>(v => v instanceof File, "Cover image is required"),
    previewPdf: z.custom<File>(v => v instanceof File, "Preview PDF is required"),
    ebookPdf: z.custom<File>(v => v instanceof File).optional(),
  })
  .refine(
    data => {
      if (data.formats.includes("E-Book") && !data.ebookPdf) {
        return false;
      }
      return true;
    },
    {
      message: "E-Book PDF file is required when E-Book format is selected",
      path: ["ebookPdf"],
    }
  )
  .refine(
    data => {
      if (data.regularPrice < data.salePrice) {
        return false;
      }
      return true;
    },
    {
      message: "Selling price cannot be higher than regular price",
      path: ["salePrice"],
    }
  );

type BookFormValues = z.input<typeof bookSchema>;

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function AddBookPage() {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [fileUploadError, setFileUploadError] = useState<string>("");
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [loadEditDataError, setLoadEditDataError] = useState<string>("");
  const [imageUploadLoading, setImageUploadLoading] = useState<boolean>(false);

  const { user } = useSessionContext();
  const router = useRouter();
  const querydata = useSearchParams();
  const editBookId = querydata.get("editBookid");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      formats: ["Hardcover"],
      regularPrice: 0,
      salePrice: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    if (!editBookId) return;
    try {
      const fetchBookData = async () => {
        const response = await apiClient.get<BookEditData>(
          `/book/admin/books/edit?bookId=${editBookId}`
        );
        console.log("response in bookEdit : ", response.data);
        if (response.success && response.data) {
          const book = response.data;
          setValue("title", book.title);
          setValue("author", book.author);
          setValue("translator", book.translator || "");
          setValue("editor", book.editor || "");
          setValue("publisher", book.publisher);
          setValue("description", book.description);
          setValue("regularPrice", book.regularPrice);
          setValue("salePrice", book.salePrice);
          setValue("stock", book.stock);
          setValue("isbn", book.isbn || "");
          setValue("edition", book.edition || "");
          setValue("pages", book.pages || undefined);
          setValue("language", book.language);
          setValue("category", book.category?.name || "");
          setValue(
            "formats",
            book.formats.map(f => (f === "HARDCOVER" ? "Hardcover" : "E-Book"))
          );
          setValue("metaKeywords", book.metaKeywords || "");
          setValue("metaDescription", book.metaDescription || "");
          setValue("coverImageUrl", book.coverImage);
          setCoverPreview(book.coverImage);
          const files = book.files || [];
          setValue(
            "files",
            files.map(f => ({
              name: f.name,
              url: f.url,
              fileType: f.fileType as "PREVIEW" | "EBOOK",
            }))
          );
          const previewFile = files.find((f: any) => f.fileType === "PREVIEW");
          if (previewFile) {
            setValue("previewPdf", previewFile as unknown as File);
            setPdfPreviewUrl(previewFile.url);
          }
          const ebookFile = files.find((f: any) => f.fileType === "EBOOK");
          if (ebookFile) {
            setValue("ebookPdf", ebookFile as unknown as File);
          }
        } else {
          setLoadEditDataError("Failed to load book data. Please try again.");
        }
      };
      fetchBookData();
    } catch (error) {
      setLoadEditDataError("Failed to load book data. Please try again.");
    }
  }, [editBookId, setValue]);

  const selectedFormats = watch("formats");
  const isEbookSelected = selectedFormats.includes("E-Book");
  const uploadedCover = watch("coverImage");
  const uploadedPreviewPdf = watch("previewPdf");
  const uploadedEbookPdf = watch("ebookPdf");

  // ─── HANDLERS ────────────────────────────────────────────────────

  const uploadFileToBunny = async (file: File): Promise<{ name: string; url: string }> => {
    setFileLoading(true);
    setFileUploadError("");

    if (!user?.id) {
      setFileUploadError("User not authenticated.");
      setFileLoading(false);
      return { name: "", url: "" };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.postFormData<string>(
        `/course/file-upload?folder=${user?.id}`,
        formData
      );

      if (!response.success || !response.data) {
        setFileUploadError(response.message || "Upload failed: try different Image or try again");
        return { name: "", url: "" };
      }

      return {
        name: file.name,
        url: response.data as string,
      };
    } catch (error: unknown) {
      setFileUploadError(error instanceof Error ? error.message : "An unknown error occurred.");
      return { name: "", url: "" };
    } finally {
      setFileLoading(false);
    }
  };

  const uploadImageToBunny = async (file: File): Promise<{ url: string }> => {
    setImageUploadLoading(true);
    setImageUploadError("");
    if (!user?.id) {
      setImageUploadError("User not authenticated.");
      setImageUploadLoading(false);
      return { url: "" };
    }

    try {
      setImageUploadError("");
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.postFormData<string>(
        `/course/file-upload?folder=${user.id}`,
        formData
      );

      if (!response.success || !response.data) {
        setImageUploadError("Upload failed: try different Image or try again");
        return { url: "" };
      }

      return {
        url: response.data,
      };
    } catch (error: unknown) {
      setImageUploadError(error instanceof Error ? error.message : "An unknown error occurred.");
      return { url: "" };
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (file) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setImageError("Only .jpg, .jpeg, .png and .webp formats are supported.");
        return;
      }

      const img = document.createElement("img");
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        if (img.width === 800 && img.height === 1200) {
          const uploadedImage = await uploadImageToBunny(file);
          if (uploadedImage.url !== "") {
            setValue("coverImageUrl", uploadedImage.url);
            setCoverPreview(objectUrl);
            setValue("coverImage", file);
            trigger("coverImage");
          }
        } else {
          setImageError(
            `Invalid dimensions. Got ${img.width}x${img.height}px. Required: 800x1200px.`
          );
          URL.revokeObjectURL(objectUrl);
        }
      };

      img.src = objectUrl;
    }
  };

  const handlePdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "previewPdf" | "ebookPdf"
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const uploadedResult = await uploadFileToBunny(file);
      if (uploadedResult && uploadedResult.url !== "") {
        const currentFileType = field === "previewPdf" ? "PREVIEW" : "EBOOK";

        const fileItem = {
          name: uploadedResult.name,
          url: uploadedResult.url,
          fileType: currentFileType,
        } as const;

        const currentFiles = watch("files") || [];

        const filteredFiles = currentFiles.filter(item => item.fileType !== currentFileType);

        setValue("files", [...filteredFiles, fileItem]);
        setValue(field, file);
        trigger(field);

        if (field === "previewPdf") {
          setPdfPreviewUrl(URL.createObjectURL(file));
        }
      }
    }
  };

  const removeFile = async (field: "coverImage" | "previewPdf" | "ebookPdf") => {
    // setValue(field, undefined as any);
    if (field === "coverImage") {
      const deletedResult = await apiClient.delete("/course/delete-file", {
        fileUrl: watch("coverImageUrl"),
      });
      if (deletedResult.success) {
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setValue("coverImage", undefined as any);
        setValue("coverImageUrl", undefined as any);
        setCoverPreview(null);
        setImageError(null);
        setImageUploadError("");
      }
      return;
    }

    const currentFileType = field === "previewPdf" ? "PREVIEW" : "EBOOK";
    const currentFiles = watch("files") || [];
    const filteredFiles = currentFiles.filter(item => item.fileType !== currentFileType);

    if (field === "previewPdf") {
      const deletedResult = await apiClient.delete("/course/delete-file", {
        fileUrl: currentFiles.find(f => f.fileType === "PREVIEW")?.url || "",
      });
      if (!deletedResult.success) {
        return;
      }
      setValue("files", [...filteredFiles]);
      setValue("previewPdf", undefined as any);
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
      setFileUploadError("");
    }

    if (field === "ebookPdf") {
      const deletedResult = await apiClient.delete("/course/delete-file", {
        fileUrl: currentFiles.find(f => f.fileType === "EBOOK")?.url || "",
      });
      if (!deletedResult.success) {
        return;
      }
      setValue("files", [...filteredFiles]);
      setValue("ebookPdf", undefined as any);
      setFileUploadError("");
    }
  };

  const handleEbookFormatChange = async (format: string[]) => {
    if (!format.includes("E-Book") && !watch("formats")?.includes("E-Book")) {
      const value = watch("files") || [];
      const ebookValue = value.find(b => b.fileType === "EBOOK")?.url;
      if (!ebookValue || ebookValue !== "") {
        await apiClient.delete("/course/delete-file", {
          fileUrl: ebookValue,
        });
      }
      setValue("ebookPdf", undefined as any);
      trigger("ebookPdf");
      const filteredFiles = value.filter(item => item.fileType !== "EBOOK");
      setValue("files", [...filteredFiles]);
    }
  };

  const onSubmit = async (data: BookFormValues) => {
    const { ebookPdf, previewPdf, coverImage, ...rest } = data;
    const uploadBookResult = await apiClient.post<{ id: string }>("/book/upload-book", rest);
    if (uploadBookResult.success) {
      alert(`Book successfully uploaded! for id ${uploadBookResult.data?.id}`);
      router.push("/dashboard/admin/books");
    }
  };

  return (
    <div className='text-white font-sans'>
      {/* Sticky Top Bar */}
      <header className='sticky top-0 z-30 bg-[#070F1D] border-b border-white/5'>
        <div className='px-7 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Link
              href='/admin/books'
              className='p-2 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-all'
            >
              <ArrowLeft size={20} />
            </Link>
            <div className='flex items-center gap-2 text-sm'>
              <span className='text-gray-500'>Books</span>
              <span className='text-gray-600'>/</span>
              <span className='text-white font-medium'>Add New</span>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {!editBookId ? (
              <>
                <button
                  type='button'
                  disabled={isSubmitting}
                  className='px-4 py-2 text-sm font-medium text-gray-400 border border-white/10 rounded hover:bg-white/5 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className='flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded bg-linear-to-r from-orange to-orange-dark hover:from-orange-dark hover:to-orange shadow shadow-orange/20 transition-colors duration-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer'
                >
                  {isSubmitting ? (
                    <span className='animate-pulse'>Processing...</span>
                  ) : (
                    <>
                      <Save size={15} />
                      Publish Book
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className='flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded bg-linear-to-r from-orange to-orange-dark hover:from-orange-dark hover:to-orange shadow shadow-orange/20 transition-colors duration-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer'
              >
                {isSubmitting ? (
                  <span className='animate-pulse'>Updating...</span>
                ) : (
                  <>
                    <Save size={15} />
                    Update Book
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className='p-7 animate-slide-up'>
        <div className='mb-7'>
          <div className='inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-3'>
            <BookOpen size={11} />
            New Entry
          </div>
          <h1 className='text-3xl font-bold tracking-tight'>Add New Book</h1>
          <p className='text-gray-500 text-sm mt-1'>
            Fill in the details to list a new product in the store.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='grid grid-cols-1 lg:grid-cols-3 gap-6'
        >
          {/* ── LEFT COLUMN ── */}
          <div className='lg:col-span-2 space-y-6'>
            {/* General Information */}
            <Card
              icon={
                <Info
                  size={15}
                  className='text-indigo-400'
                />
              }
              iconBg='bg-indigo-500/10'
              title='General Information'
            >
              <div className='space-y-4'>
                <Field
                  label='Book Title'
                  error={errors.title?.message}
                >
                  <input
                    {...register("title")}
                    type='text'
                    className={getInputClass(!!errors.title)}
                    placeholder='e.g. উদ্দেশ্যহীন আর কত দিন?'
                  />
                </Field>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Field
                    label='Main Author'
                    error={errors.author?.message}
                  >
                    <div className='relative'>
                      <input
                        {...register("author")}
                        type='text'
                        className={`${getInputClass(!!errors.author)} pl-10`}
                        placeholder='Author Name'
                      />
                      <User
                        size={16}
                        className='absolute left-3.5 top-3.5 text-gray-500'
                      />
                    </div>
                  </Field>
                  <Field
                    label='Publisher'
                    error={errors.publisher?.message}
                  >
                    <div className='relative'>
                      <input
                        {...register("publisher")}
                        type='text'
                        className={`${getInputClass(!!errors.publisher)} pl-10`}
                        placeholder='Publisher Name'
                      />
                      <Building
                        size={16}
                        className='absolute left-3.5 top-3.5 text-gray-500'
                      />
                    </div>
                  </Field>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Field
                    label='Translator'
                    error={errors.translator?.message}
                  >
                    <div className='relative'>
                      <input
                        {...register("translator")}
                        type='text'
                        className={`${getInputClass(!!errors.translator)} pl-10`}
                        placeholder='Optional'
                      />
                      <Languages
                        size={16}
                        className='absolute left-3.5 top-3.5 text-gray-500'
                      />
                    </div>
                  </Field>
                  <Field
                    label='Editor'
                    error={errors.editor?.message}
                  >
                    <div className='relative'>
                      <input
                        {...register("editor")}
                        type='text'
                        className={`${getInputClass(!!errors.editor)} pl-10`}
                        placeholder='Optional'
                      />
                      <PenTool
                        size={16}
                        className='absolute left-3.5 top-3.5 text-gray-500'
                      />
                    </div>
                  </Field>
                </div>

                <Field
                  label='Description'
                  error={errors.description?.message}
                >
                  <textarea
                    {...register("description")}
                    rows={5}
                    className={`${getInputClass(!!errors.description)} resize-none`}
                    placeholder='Write the book summary here...'
                  />
                </Field>
              </div>
            </Card>

            {/* Pricing & Stock */}
            <Card
              icon={
                <DollarSign
                  size={15}
                  className='text-emerald-400'
                />
              }
              iconBg='bg-emerald-500/10'
              title='Pricing & Stock'
            >
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Field
                  label='Regular Price (TK)'
                  error={errors.regularPrice?.message}
                >
                  <input
                    {...register("regularPrice")}
                    type='number'
                    min={0}
                    className={`${getInputClass(!!errors.regularPrice)}`}
                  />
                </Field>
                <Field
                  label='Sale Price (TK)'
                  error={errors.salePrice?.message}
                >
                  <input
                    {...register("salePrice")}
                    type='number'
                    min={0}
                    className={getInputClass(!!errors.salePrice)}
                  />
                </Field>
                <Field
                  label='Stock Quantity'
                  error={errors.stock?.message}
                >
                  <input
                    {...register("stock")}
                    type='number'
                    min={0}
                    className={getInputClass(!!errors.stock)}
                  />
                </Field>
              </div>
            </Card>

            {/* Specifications */}
            <Card
              icon={
                <Hash
                  size={15}
                  className='text-amber-400'
                />
              }
              iconBg='bg-amber-500/10'
              title='Specifications'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Field
                  label='ISBN'
                  error={errors.isbn?.message}
                >
                  <input
                    {...register("isbn")}
                    type='text'
                    className={getInputClass(!!errors.isbn)}
                    placeholder='978-...'
                  />
                </Field>
                <Field
                  label='Edition'
                  error={errors.edition?.message}
                >
                  <input
                    {...register("edition")}
                    type='text'
                    className={getInputClass(!!errors.edition)}
                    placeholder='1st Edition'
                  />
                </Field>
                <Field
                  label='Pages'
                  error={errors.pages?.message}
                >
                  <input
                    {...register("pages")}
                    type='number'
                    className={getInputClass(!!errors.pages)}
                  />
                </Field>
                <Field
                  label='Language'
                  error={errors.language?.message}
                >
                  <select
                    {...register("language")}
                    className={getInputClass(!!errors.language)}
                  >
                    <option value=''>Select Language</option>
                    <option value='Bengali'>Bengali</option>
                    <option value='English'>English</option>
                    <option value='Arabic'>Arabic</option>
                  </select>
                </Field>
              </div>
            </Card>

            {/* SEO Meta */}
            <Card
              icon={
                <Search
                  size={15}
                  className='text-violet-400'
                />
              }
              iconBg='bg-violet-500/10'
              title='SEO Meta'
            >
              <div className='space-y-4'>
                <Field
                  label='Meta Keywords'
                  error={errors.metaKeywords?.message}
                >
                  <input
                    {...register("metaKeywords")}
                    type='text'
                    className={getInputClass(!!errors.metaKeywords)}
                    placeholder='Islamic, Spirituality...'
                  />
                </Field>
                <Field
                  label='Meta Description'
                  error={errors.metaDescription?.message}
                >
                  <textarea
                    {...register("metaDescription")}
                    rows={3}
                    className={`${getInputClass(!!errors.metaDescription)} resize-none`}
                    placeholder='Short SEO summary...'
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className='space-y-6'>
            {/* Book Cover */}
            <Card
              icon={
                <ImageIcon
                  size={15}
                  className='text-pink-400'
                />
              }
              iconBg='bg-pink-500/10'
              title='Book Cover'
            >
              <Field
                label=''
                error={
                  (errors.coverImage?.message as string) ||
                  imageError ||
                  imageUploadError ||
                  undefined
                }
              >
                {imageUploadLoading ? (
                  <div className='p-6 rounded border border-white/10 flex items-center justify-center gap-2'>
                    <Loader className='animate-spin' /> Uploading...
                  </div>
                ) : (
                  <>
                    {uploadedCover && coverPreview ? (
                      <div className='relative rounded overflow-hidden border border-white/10 group'>
                        <Image
                          width={800}
                          height={1200}
                          src={coverPreview}
                          alt='Cover'
                          className='w-full h-auto object-cover'
                        />
                        <button
                          type='button'
                          onClick={() => removeFile("coverImage")}
                          className='absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer'
                        >
                          <X size={16} />
                        </button>
                        <div className='absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white'>
                          800 × 1200px
                        </div>
                      </div>
                    ) : (
                      <div className='relative'>
                        <input
                          type='file'
                          accept='.jpg,.jpeg,.png,.webp'
                          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                          onChange={handleImageUpload}
                        />
                        <div
                          className={`border-2 border-dashed rounded p-8 flex flex-col items-center justify-center transition-all ${imageError || imageUploadError || errors.coverImage ? "border-red-500/30 bg-red-500/5" : "border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5"}`}
                        >
                          <div className='w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mb-3'>
                            <Upload
                              size={18}
                              className='text-gray-500'
                            />
                          </div>
                          <p className='text-sm font-medium text-gray-400 text-center'>
                            Upload Cover
                          </p>
                          <span className='text-xs text-gray-600 mt-1'>Required: 800 × 1200px</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Field>
            </Card>

            {/* Preview PDF */}
            <Card
              icon={
                <Eye
                  size={15}
                  className='text-cyan-400'
                />
              }
              iconBg='bg-cyan-500/10'
              title='Preview PDF (Read Only)'
            >
              <Field
                label='For User Preview'
                error={(errors.previewPdf?.message as string) || fileUploadError}
              >
                {fileLoading ? (
                  <div className='p-6 rounded border border-white/10 flex items-center justify-center gap-2'>
                    <Loader className='animate-spin' /> Uploading file...
                  </div>
                ) : (
                  <>
                    {uploadedPreviewPdf ? (
                      <FilePreviewItem
                        file={uploadedPreviewPdf as File}
                        onRemove={() => removeFile("previewPdf")}
                        onPreview={() => setIsPdfModalOpen(true)}
                      />
                    ) : (
                      <div className='relative'>
                        <input
                          type='file'
                          accept='.pdf'
                          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                          onChange={e => handlePdfUpload(e, "previewPdf")}
                        />
                        <div className='border-2 border-dashed border-white/10 rounded p-6 flex flex-col items-center justify-center hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all'>
                          <Upload
                            size={18}
                            className='text-gray-500 mb-2'
                          />
                          <span className='text-xs text-gray-400'>Upload PDF for Preview</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Field>
            </Card>

            {/* Category & Format */}
            <Card
              icon={
                <Tag
                  size={15}
                  className='text-blue-400'
                />
              }
              iconBg='bg-blue-500/10'
              title='Category & Format'
            >
              <div className='space-y-5'>
                <Field
                  label='Category'
                  error={errors.category?.message}
                >
                  <select
                    {...register("category")}
                    className={getInputClass(!!errors.category)}
                  >
                    <option value=''>Select Category</option>
                    <option value='islamic'>Islamic: Self Development</option>
                    <option value='history'>History</option>
                    <option value='novel'>Novel</option>
                  </select>
                </Field>

                <Field
                  label='Format'
                  error={errors.formats?.message}
                >
                  <div className='grid grid-cols-2 gap-3 mt-1'>
                    <Controller
                      name='formats'
                      control={control}
                      render={({ field }) => (
                        <>
                          {["Hardcover", "E-Book"].map(fmt => (
                            <label
                              key={fmt}
                              className={`flex items-center gap-3 border rounded px-4 py-3 cursor-pointer transition-colors duration-300 ${field.value.includes(fmt) ? "bg-orange border-0" : "bg-transparent border-white/10 hover:border-white/20"}`}
                            >
                              <input
                                type='checkbox'
                                value={fmt}
                                checked={field.value.includes(fmt)}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  const newValue = checked
                                    ? [...field.value, fmt]
                                    : field.value.filter(v => v !== fmt);
                                  field.onChange(newValue);
                                  handleEbookFormatChange(newValue);
                                }}
                                className='w-4 h-4 accent-orange-dark'
                              />
                              <span className='text-sm'>{fmt}</span>
                            </label>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </Field>
              </div>
            </Card>

            {/* Conditional E-Book Upload */}
            {isEbookSelected && (
              <div className='animate-slide-up'>
                <Card
                  icon={
                    <FileText
                      size={15}
                      className='text-orange-400'
                    />
                  }
                  iconBg='bg-orange-500/10'
                  title='Full E-Book File'
                >
                  <Field
                    label='Product File'
                    error={errors.ebookPdf?.message as string}
                  >
                    {fileLoading ? (
                      <div className='p-6 rounded border border-white/10 flex items-center justify-center gap-2'>
                        <Loader className='animate-spin' /> Uploading file...
                      </div>
                    ) : (
                      <>
                        {uploadedEbookPdf ? (
                          <FilePreviewItem
                            file={uploadedEbookPdf as File}
                            onRemove={() => removeFile("ebookPdf")}
                          />
                        ) : (
                          <div className='relative'>
                            <input
                              type='file'
                              accept='.pdf'
                              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                              onChange={e => handlePdfUpload(e, "ebookPdf")}
                            />
                            <div className='border-2 border-dashed border-white/10 rounded p-6 flex flex-col items-center justify-center hover:border-orange-500/30 hover:bg-orange-500/5 transition-all'>
                              <Upload
                                size={18}
                                className='text-gray-500 mb-2'
                              />
                              <span className='text-xs text-gray-400'>Upload Full Book PDF</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </Field>
                </Card>
              </div>
            )}
          </div>
        </form>
      </main>

      {/* ── PDF READER MODAL (Using react-pdf) ── */}
      {isPdfModalOpen && pdfPreviewUrl && (
        <PdfPreviewModal
          url={pdfPreviewUrl}
          fileName={uploadedPreviewPdf instanceof File ? uploadedPreviewPdf.name : "Preview"}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </div>
  );
}

// ─── HELPER COMPONENTS ─────────────────────────────────────────────

// 2. File Item UI
function FilePreviewItem({
  file,
  onRemove,
  onPreview,
}: {
  file: File;
  onRemove: () => void;
  onPreview?: () => void;
}) {
  return (
    <div className='flex items-center gap-3 bg-transparent border border-white/10 rounded p-3 group'>
      <div className='w-10 h-10 bg-indigo-500/10 rounded flex items-center justify-center shrink-0'>
        <FileText
          size={17}
          className='text-indigo-400'
        />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium truncate text-gray-200'>{file.name}</p>
        <p className='text-[10px] text-gray-500'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <div className='flex items-center gap-1'>
        {onPreview && (
          <button
            type='button'
            onClick={onPreview}
            className='p-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors'
            title='Preview PDF'
          >
            <Eye size={14} />
          </button>
        )}
        <button
          type='button'
          onClick={onRemove}
          className='p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors'
          title='Remove'
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// 3. UI Helpers
function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className='space-y-2'>
      <div className='flex justify-between items-center'>
        <label className='block text-[11px] font-semibold uppercase tracking-widest text-gray-500'>
          {label}
        </label>
        {error && (
          <span className='flex items-center gap-1 text-[10px] text-red-400 font-medium'>
            <AlertCircle size={10} /> {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Card({
  icon,
  iconBg,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='bg-transparent border border-white/[0.07] rounded overflow-hidden'>
      <div className='flex items-center gap-3 px-6 py-4 border-b border-white/5'>
        <div className={`p-2 rounded ${iconBg}`}>{icon}</div>
        <h2 className='text-sm font-semibold text-white'>{title}</h2>
      </div>
      <div className='p-6'>{children}</div>
    </div>
  );
}

const getInputClass = (hasError: boolean) =>
  `w-full bg-transparent border rounded px-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-none [&>option]:bg-[#070F1D] [&::-webkit-inner-spin-button]:appearance-none transition-all ${
    hasError
      ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
      : "border-white/[0.07] focus:ring-1 focus:ring-orange"
  }`;
