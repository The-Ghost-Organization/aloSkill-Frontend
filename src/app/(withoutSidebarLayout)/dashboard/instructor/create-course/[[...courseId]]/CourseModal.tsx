"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { CourseModule, CreateCourseData } from "./page";

const CourseModal = ({
  modalType,
  setOpeModal,
  setSections,
  sectionId,
  lectureId,
  courseData,
  setCourseData,
}: {
  modalType: string;
  setOpeModal: React.Dispatch<
    React.SetStateAction<{ type: string; sectionId?: number; lectureId?: number }>
  >;
  sections: CourseModule[];
  setSections: React.Dispatch<React.SetStateAction<CourseModule[]>>;
  sectionId: number | undefined;
  lectureId: number | undefined;
  courseData: CreateCourseData;
  setCourseData: React.Dispatch<React.SetStateAction<CreateCourseData>>;
}) => {
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const updateModuleNamefield = (sectionId: number | undefined, value: string) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.position !== sectionId) {
          return section;
        }
        return {
          ...section,
          title: value,
        };
      })
    );
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position !== sectionId) {
          return module;
        }
        return {
          ...module,
          title: value,
        };
      }),
    }));
  };

  const updateLectureNameField = (
    sectionId: number | undefined,
    lectureId: number | undefined,
    value: string
  ) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.position !== sectionId) {
          return section;
        }

        const updatedLectures = section.lessons.map(lecture => {
          if (lecture.position !== lectureId) {
            return lecture;
          }
          return {
            ...lecture,
            title: value,
          };
        });
        return {
          ...section,
          lessons: updatedLectures,
        };
      })
    );
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position !== sectionId) {
          return module;
        }

        const updatedLectures = module.lessons.map(lecture => {
          if (lecture.position !== lectureId) {
            return lecture;
          }
          return {
            ...lecture,
            title: value,
          };
        });
        return {
          ...module,
          lessons: updatedLectures,
        };
      }),
    }));
  };

  const handleSubmit = () => {
    if (file) {
      // Here you would implement your actual upload logic
      alert("Updating lecture details...");
      handleClose();
      setOpeModal({ type: "" });
    } else {
      alert("Updating lecture details...");
      setOpeModal({ type: "" });
    }
  };

  const handleClose = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview("");
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div className='fixed inset-0 bg-gray-600/60 bg-opacity-50 flex items-center justify-center z-50'>
        {/* Modal Container */}
        <div className='bg-white rounded w-full max-w-md'>
          {/* Modal Header */}
          <div className='flex items-center justify-between px-4 py-2 border-b border-gray-200'>
            <h4 className='font-semibold text-gray-900'>
              {(() => {
                switch (modalType) {
                  case "sectionName":
                    return "Edit Section Name";
                  case "lectureName":
                    return "Edit Lecture Name";
                  default:
                    return "";
                }
              })()}
            </h4>
            <button
              onClick={() => setOpeModal({ type: "" })}
              className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5 text-gray-500' />
            </button>
          </div>

          {/* Modal Body */}
          <div className='p-4 space-y-4'>
            {(() => {
              switch (modalType) {
                case "sectionName":
                  return (
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Section Name
                      </label>
                      <input
                        type='text'
                        maxLength={150}
                        defaultValue={courseData.modules.find(m => m.position === sectionId)?.title || ""}
                        onChange={e => updateModuleNamefield(sectionId, e.target.value)}
                        placeholder='Enter section name here...'
                        className='w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-gray-400 placeholder:text-sm'
                      />
                    </div>
                  );
                case "lectureName":
                  return (
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Lecture Name
                      </label>
                      <input
                        type='text'
                        maxLength={150}
                        defaultValue={courseData.modules.find(m => m.position === sectionId)?.lessons.find(l => l.position === lectureId)?.title || ""}
                        onChange={e => updateLectureNameField(sectionId, lectureId, e.target.value)}
                        placeholder='Enter section name here...'
                        className='w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-gray-400 placeholder:text-sm'
                      />
                    </div>
                  );
                default:
                  return <></>;
              }
            })()}

            {/* Action Buttons */}
            <div className='flex items-center justify-between pt-2'>
              <button
                onClick={() => setOpeModal({ type: "" })}
                className='px-4 py-1.5 text-gray-700 font-medium hover:bg-gray-100 rounded transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className='px-4 py-1.5 bg-orange-500 text-white font-medium rounded hover:bg-orange-600 transition-colors flex items-center gap-2'
              >
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseModal;
