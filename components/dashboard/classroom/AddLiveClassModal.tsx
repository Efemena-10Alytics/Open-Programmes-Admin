"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";

interface AddLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
  cohortCourseId: string;
}

const AddLiveClassModal: React.FC<AddLiveClassModalProps> = ({
  isOpen,
  onClose,
  cohortId,
  cohortCourseId,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [showNewTopicInput, setShowNewTopicInput] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    liveLink: "",
    startTime: "",
    endTime: "",
  });

  const queryClient = useQueryClient();

  const { data: topicsData } = useQuery({
    queryKey: ["manageTopics", cohortId],
    queryFn: async () => {
      const response = await api.get(`/api/classroom/${cohortId}/topics`);
      return response.data;
    },
    enabled: !!cohortId && isOpen,
  });

  const topics = topicsData?.topics;

  const addLiveClassMutation = useMutation({
    mutationFn: async () => {
      let finalTopicId = selectedTopicId;

      if (showNewTopicInput && newTopicTitle.trim()) {
        const topicResponse = await api.post("/api/classroom/topics", {
          title: newTopicTitle.trim(),
          cohortCourseId,
        });
        finalTopicId = topicResponse.data.topic.id;
      }

      const response = await api.post("/api/classroom/items", {
        topicId: finalTopicId || null,
        cohortCourseId,
        type: "liveClass",
        data: {
          title: formData.title,
          description: formData.description,
          liveLink: formData.liveLink,
          startTime: formData.startTime ? new Date(formData.startTime).toISOString() : undefined,
          endTime: formData.endTime ? new Date(formData.endTime).toISOString() : undefined,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manageTopics"] });
      queryClient.invalidateQueries({ queryKey: ["classroomTopics"] });
      queryClient.invalidateQueries({ queryKey: ["classroom"] });
      queryClient.invalidateQueries({ queryKey: ["streamActivities"] });
      toast.success("Live class scheduled successfully");
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to schedule live class");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.liveLink.trim() || !formData.startTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    addLiveClassMutation.mutate();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Optional: close on backdrop click, but we'll follow standard modal behavior
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      liveLink: "",
      startTime: "",
      endTime: "",
    });
    setSelectedTopicId("");
    setShowNewTopicInput(false);
    setNewTopicTitle("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Schedule Live Class
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set up a virtual session for your students
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Topic Selection */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Classroom Topic
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowNewTopicInput(!showNewTopicInput);
                  if (!showNewTopicInput) {
                    setSelectedTopicId("");
                  } else {
                    setSelectedTopicId(topics?.[0]?.id || "");
                  }
                }}
                className="text-xs text-[#6742FA] hover:text-[#5235c7] font-medium"
              >
                {showNewTopicInput ? "← Select existing topic" : "+ Create new topic"}
              </button>
            </div>

            {showNewTopicInput ? (
              <input
                type="text"
                placeholder="Enter new topic title (e.g. Week 1: Introduction)"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#6742FA] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] bg-white"
                autoFocus
              />
            ) : (
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] bg-white"
              >
                <option value="">No Topic (General)</option>
                {topics?.map((topic: any) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter live class title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Live Class Link (Zoom, Google Meet, etc.) *
              </label>
              <input
                type="url"
                required
                value={formData.liveLink}
                onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLiveClassMutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6742FA] hover:bg-[#5235c7] focus:outline-none focus:ring-2 focus:ring-[#6742FA] disabled:opacity-50"
            >
              {addLiveClassMutation.isPending ? "Scheduling..." : "Schedule Live Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLiveClassModal;
