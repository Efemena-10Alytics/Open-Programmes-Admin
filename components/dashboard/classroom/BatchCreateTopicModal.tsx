"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/api";
import { X, Check } from "lucide-react";
import { toast } from "sonner";

interface BatchCreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cohorts: any[];
}

const BatchCreateTopicModal: React.FC<BatchCreateTopicModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  cohorts,
}) => {
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [topicData, setTopicData] = useState({
    title: "",
    description: "",
    isPinned: false,
  });

  const queryClient = useQueryClient();

  const batchCreateTopicMutation = useMutation({
    mutationFn: async () => {
      // Get cohort course IDs for selected cohorts
      const cohortCourseIds = await Promise.all(
        selectedCohorts.map(async (cohortId) => {
          const response = await api.get(`/api/classroom/${cohortId}`);
          return response.data.cohortCourses[0]?.id;
        })
      ).then(ids => ids.filter(Boolean));

      const response = await api.post("/api/classroom/batch/topics", {
        ...topicData,
        cohortCourseIds,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Successfully created topics in ${data.summary.successful} cohorts`);
      queryClient.invalidateQueries({ queryKey: ["manageTopics"] });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.response?.data?.error || "Failed to create topics"}`);
    },
  });

  const resetForm = () => {
    setSelectedCohorts([]);
    setTopicData({
      title: "",
      description: "",
      isPinned: false,
    });
  };

  const handleCohortToggle = (cohortId: string) => {
    setSelectedCohorts(prev =>
      prev.includes(cohortId)
        ? prev.filter(id => id !== cohortId)
        : [...prev, cohortId]
    );
  };

  const handleSubmit = () => {
    if (!topicData.title.trim()) {
      toast.error("Topic title is required");
      return;
    }
    if (selectedCohorts.length === 0) {
      toast.error("Please select at least one cohort");
      return;
    }
    batchCreateTopicMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Create Topic in Multiple Cohorts
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Topic Title *
                    </label>
                    <input
                      type="text"
                      value={topicData.title}
                      onChange={(e) => setTopicData({ ...topicData, title: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={topicData.description}
                      onChange={(e) => setTopicData({ ...topicData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={topicData.isPinned}
                      onChange={(e) => setTopicData({ ...topicData, isPinned: e.target.checked })}
                      className="h-4 w-4 text-[#6742FA] focus:ring-[#6742FA] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Pin this topic at the top
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Cohorts *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
                      {cohorts?.map((cohort: any) => (
                        <div
                          key={cohort.id}
                          onClick={() => handleCohortToggle(cohort.id)}
                          className={`
                            p-3 border rounded-lg cursor-pointer transition-all
                            ${selectedCohorts.includes(cohort.id)
                              ? "border-[#6742FA] bg-[#6742FA0D]"
                              : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{cohort.name}</h4>
                              <p className="text-sm text-gray-600">{cohort.course?.title}</p>
                            </div>
                            {selectedCohorts.includes(cohort.id) && (
                              <Check className="w-5 h-5 text-[#6742FA]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#6742FA0D] border-l-4 border-[#6742FA] p-4">
                    <p className="text-sm text-[#5235c7]">
                      This topic will be created in {selectedCohorts.length} selected cohorts.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!topicData.title.trim() || selectedCohorts.length === 0 || batchCreateTopicMutation.isPending}
                      className={`
                        px-4 py-2 rounded-md flex items-center
                        ${!topicData.title.trim() || selectedCohorts.length === 0 || batchCreateTopicMutation.isPending
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#6742FA] text-white hover:bg-[#5235c7]"
                        }
                      `}
                    >
                      {batchCreateTopicMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        `Create in ${selectedCohorts.length} Cohorts`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchCreateTopicModal;