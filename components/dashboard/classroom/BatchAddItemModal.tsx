"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/api";
import { X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BatchAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Cohort {
  id: string;
  name: string;
  course: {
    title: string;
  };
}

interface Topic {
  id: string;
  title: string;
  description?: string;
  cohortCourse: {
    cohort: {
      id: string;
      name: string;
    };
    course: {
      title: string;
    };
  };
  _count: {
    assignments: number;
    classMaterials: number;
    classRecordings: number;
  };
}

const BatchAddItemModal: React.FC<BatchAddItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"select-cohorts" | "select-topics" | "add-item">("select-cohorts");
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [itemType, setItemType] = useState<"assignment" | "material" | "recording">("assignment");
  const [itemData, setItemData] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    points: 100,
    fileUrl: "",
    recordingUrl: "",
  });

  // Fetch all cohorts
  const { data: cohorts, isLoading: cohortsLoading } = useQuery({
    queryKey: ["adminCohorts"],
    queryFn: async () => {
      const response = await api.get("/api/cohorts");
      return response.data.data;
    },
    enabled: isOpen,
  });

  // Fetch topics for selected cohorts
  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ["batchTopics", selectedCohorts],
    queryFn: async () => {
      if (selectedCohorts.length === 0) return { topics: {} };
      const response = await api.get(
        `/api/classroom/batch/topics?cohortIds=${selectedCohorts.join(",")}`
      );
      return response.data;
    },
    enabled: selectedCohorts.length > 0 && isOpen,
  });

  const batchAddMutation = useMutation({
    mutationFn: async () => {
      const data = {
        type: itemType,
        data: getItemData(),
        topicIds: selectedTopics,
      };
      const response = await api.post("/api/classroom/batch/items", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Successfully added item to ${data.summary.successful} topics`);
      queryClient.invalidateQueries({ queryKey: ["manageTopics"] });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.response?.data?.error || "Failed to add items"}`);
    },
  });

  const getItemData = () => {
    const baseData = {
      title: itemData.title,
      description: itemData.description,
    };

    switch (itemType) {
      case "assignment":
        return {
          ...baseData,
          instructions: itemData.instructions,
          dueDate: itemData.dueDate ? new Date(itemData.dueDate).toISOString() : null,
          points: parseInt(itemData.points.toString()) || 100,
          type: "REGULAR",
        };
      case "material":
        return {
          ...baseData,
          fileUrl: itemData.fileUrl,
          fileType: "pdf",
        };
      case "recording":
        return {
          ...baseData,
          recordingUrl: itemData.recordingUrl,
        };
      default:
        return baseData;
    }
  };

  const resetForm = () => {
    setSelectedCohorts([]);
    setSelectedTopics([]);
    setStep("select-cohorts");
    setItemData({
      title: "",
      description: "",
      instructions: "",
      dueDate: "",
      points: 100,
      fileUrl: "",
      recordingUrl: "",
    });
  };

  const handleCohortToggle = (cohortId: string) => {
    setSelectedCohorts(prev =>
      prev.includes(cohortId)
        ? prev.filter(id => id !== cohortId)
        : [...prev, cohortId]
    );
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSelectAllTopics = () => {
    if (!topicsData?.topics) return;
    
    const allTopicIds: string[] = [];
    Object.values(topicsData.topics).forEach((cohortData: any) => {
      cohortData.topics.forEach((topic: Topic) => {
        allTopicIds.push(topic.id);
      });
    });

    if (selectedTopics.length === allTopicIds.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(allTopicIds);
    }
  };

  const renderCohortSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Cohorts</h3>
      <p className="text-sm text-gray-600">
        Choose which cohorts you want to add this item to
      </p>
      
      {cohortsLoading ? (
        <div className="text-center py-4">Loading cohorts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
          {cohorts?.map((cohort: Cohort) => (
            <div
              key={cohort.id}
              onClick={() => handleCohortToggle(cohort.id)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                ${selectedCohorts.includes(cohort.id)
                  ? "border-[#6742FA] bg-[#6742FA0D]"
                  : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{cohort.name}</h4>
                  <p className="text-sm text-gray-600">{cohort.course.title}</p>
                </div>
                {selectedCohorts.includes(cohort.id) && (
                  <Check className="w-5 h-5 text-[#6742FA]" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => selectedCohorts.length > 0 && setStep("select-topics")}
          disabled={selectedCohorts.length === 0}
          className={`
            px-4 py-2 rounded-md
            ${selectedCohorts.length > 0
              ? "bg-[#6742FA] text-white hover:bg-[#5235c7]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Next: Select Topics ({selectedCohorts.length} cohorts)
        </button>
      </div>
    </div>
  );

  const renderTopicSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Select Topics</h3>
          <p className="text-sm text-gray-600">
            Choose specific topics to add the item to
          </p>
        </div>
        <button
          onClick={handleSelectAllTopics}
          className="text-sm text-[#6742FA] hover:text-[#5235c7]"
        >
          {selectedTopics.length > 0 ? "Deselect All" : "Select All"}
        </button>
      </div>

      {topicsLoading ? (
        <div className="text-center py-4">Loading topics...</div>
      ) : !topicsData?.topics || Object.keys(topicsData.topics).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No topics found in selected cohorts. Create topics first.
        </div>
      ) : (
        <div className="space-y-6 max-h-96 overflow-y-auto p-2">
          {Object.entries(topicsData.topics).map(([cohortId, cohortData]: [string, any]) => (
            <div key={cohortId} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {cohortData.cohort.name} • {cohortData.course.title}
              </h4>
              
              {cohortData.topics.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No topics in this cohort</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {cohortData.topics.map((topic: Topic) => (
                    <div
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.id)}
                      className={`
                        p-3 border rounded cursor-pointer transition-all
                        ${selectedTopics.includes(topic.id)
                          ? "border-[#6742FA] bg-[#6742FA0D]"
                          : "border-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{topic.title}</h5>
                          {topic.description && (
                            <p className="text-sm text-gray-600 truncate">
                              {topic.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>📝 {topic._count.assignments}</span>
                            <span>📎 {topic._count.classMaterials}</span>
                            <span>🎥 {topic._count.classRecordings}</span>
                          </div>
                        </div>
                        {selectedTopics.includes(topic.id) && (
                          <Check className="w-5 h-5 text-[#6742FA]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep("select-cohorts")}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => setStep("add-item")}
          disabled={selectedTopics.length === 0}
          className={`
            px-4 py-2 rounded-md
            ${selectedTopics.length > 0
              ? "bg-[#6742FA] text-white hover:bg-[#5235c7]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Next: Add Item ({selectedTopics.length} topics)
        </button>
      </div>
    </div>
  );

  const renderAddItem = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Add Item to Multiple Topics</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Type
          </label>
          <div className="flex space-x-4">
            {["assignment", "material", "recording"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setItemType(type as any)}
                className={`
                  px-4 py-2 rounded-md capitalize
                  ${itemType === type
                    ? "bg-[#6742FA] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            value={itemData.title}
            onChange={(e) => setItemData({ ...itemData, title: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={itemData.description}
            onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
          />
        </div>

        {itemType === "assignment" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instructions
              </label>
              <textarea
                value={itemData.instructions}
                onChange={(e) => setItemData({ ...itemData, instructions: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={itemData.dueDate}
                  onChange={(e) => setItemData({ ...itemData, dueDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Points
                </label>
                <input
                  type="number"
                  value={itemData.points}
                  onChange={(e) => setItemData({ ...itemData, points: parseInt(e.target.value) || 100 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
                  min="0"
                  max="1000"
                />
              </div>
            </div>
          </>
        )}

        {itemType === "material" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              File URL *
            </label>
            <input
              type="url"
              value={itemData.fileUrl}
              onChange={(e) => setItemData({ ...itemData, fileUrl: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
              required
              placeholder="https://example.com/file.pdf"
            />
          </div>
        )}

        {itemType === "recording" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recording URL *
            </label>
            <input
              type="url"
              value={itemData.recordingUrl}
              onChange={(e) => setItemData({ ...itemData, recordingUrl: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6742FA] focus:border-[#6742FA]"
              required
              placeholder="https://example.com/recording.mp4"
            />
          </div>
        )}

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This item will be added to {selectedTopics.length} topics across {selectedCohorts.length} cohorts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => setStep("select-topics")}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ← Back
        </button>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => batchAddMutation.mutate()}
            disabled={!itemData.title || batchAddMutation.isPending}
            className={`
              px-4 py-2 rounded-md flex items-center
              ${!itemData.title || batchAddMutation.isPending
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#6742FA] text-white hover:bg-[#5235c7]"
              }
            `}
          >
            {batchAddMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding...
              </>
            ) : (
              `Add to ${selectedTopics.length} Topics`
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Add to Multiple Cohorts
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-2">
                  {step === "select-cohorts" && renderCohortSelection()}
                  {step === "select-topics" && renderTopicSelection()}
                  {step === "add-item" && renderAddItem()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchAddItemModal;