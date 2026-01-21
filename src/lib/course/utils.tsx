import { useEffect, useState } from "react";
import { courseDraftStorage } from "../storage/courseDraftStorage.ts";

export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {children}
    </div>
  );
}

type CourseDescriptionParsed = {
  objective: string;
  description: string;
  whyThisCourse: string[];
  whatYouTeach: string[];
  targetAudience: string[];
  requirements: string[];
};
export const parseCourseDescription = (rawData?: string | null): CourseDescriptionParsed => {
  try {
    const parsed = JSON.parse(rawData || "{}");

    return {
      objective: parsed.objective ?? "",
      description: parsed.description ?? "",
      whyThisCourse: parsed.whyThisCourse?.split("||").filter(Boolean) ?? [],
      whatYouTeach: parsed.whatYouTeach?.split("||").filter(Boolean) ?? [],
      targetAudience: parsed.targetAudience?.split("||").filter(Boolean) ?? [],
      requirements: parsed.requirements?.split("||").filter(Boolean) ?? [],
    };
  } catch {
    return {
      objective: "",
      description: "",
      whyThisCourse: [],
      whatYouTeach: [],
      targetAudience: [],
      requirements: [],
    };
  }
};

export const courseAddToCartHandler = (courseId: string) => {
  const getStorageData = courseDraftStorage.get<{ courseId: string; quantity: number }[]>() || [];
  if (getStorageData?.find(item => item.courseId === courseId)) return getStorageData;
  getStorageData?.push({ courseId, quantity: 1 });
  courseDraftStorage.save(getStorageData);
  return getStorageData;
};

export const getFileIdFromUrl = (url: string) => {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/");
    return parts.pop() || parts.pop();
  } catch (_error: unknown) {
    // console.error("Invalid URL provided");
    return "";
  }
};
