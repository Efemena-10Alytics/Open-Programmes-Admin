"use client";

import { useEffect, useState } from "react";
import { Grip, Pencil, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ModuleType } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import ModuleForm from "./module-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ModuleListProps {
  modules: ModuleType[];
  weekId: string | undefined;
  courseId: string;
}

const ModuleList = ({ modules, weekId, courseId }: ModuleListProps) => {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <ModuleForm
          open={showModal}
          setIsOpen={setShowModal}
          weekId={weekId}
          courseId={courseId}
        />
      )}

      <div>
        <div className="flex justify-end mb-5">
          <Button
            onClick={() => {
              setShowModal(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          {modules.map((module, index) => (
            <div key={module?.id}>
              <div
                className={cn(
                  "flex items-center gap-x-2 bg-sky-200 border border-sky-200 text-sky-700 rounded-md mb-4 text-sm"
                )}
              >
                <div
                  className={cn(
                    "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition"
                  )}
                >
                  <picture>
                    <img
                      src={module?.iconUrl}
                      alt=""
                      className="h-5 w-5 rounded-full object-contain"
                    />
                  </picture>
                </div>
                {module.title}
                <div className="ml-auto pr-2 flex items-center gap-x-2">
                  <Pencil
                    onClick={() => {
                      router.push(
                        `/courses/${courseId}/weeks/${weekId}/modules/${module?.id}`
                      );
                    }}
                    className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                  />
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </>
  );
};

export default ModuleList;
