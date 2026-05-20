"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/api";
import { X } from "lucide-react";

interface CreateTopicModalProps {
  cohortId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({
  cohortId,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPinned: false,
  });

  const queryClient = useQueryClient();

  const createTopicMutation = useMutation({
    mutationFn: async (topicData: typeof formData) => {
      // First, get the cohort course ID for this cohort
      const cohortResponse = await api.get(`/api/classroom/${cohortId}`);
      const cohortCourseId = cohortResponse.data.cohortCourses?.[0]?.id;

      if (!cohortCourseId) {
        throw new Error("Cohort course not found");
      }

      const response = await api.post("/api/classroom/topics", {
        ...topicData,
        cohortCourseId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manageTopics", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["classroomTopics", cohortId] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      createTopicMutation.mutate(formData);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create New Topic</h2>
            <p className="text-sm text-gray-600 mt-1">
              Organize your classroom content with topics
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Topic Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Week 1: Introduction to Programming"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this topic covers..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="h-4 w-4 text-[#6742FA] focus:ring-[#6742FA] border-gray-300 rounded"
            />
            <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
              Pin this topic to the top
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTopicMutation.isPending || !formData.title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#6742FA] border border-transparent rounded-md hover:bg-[#5235c7] focus:outline-none focus:ring-2 focus:ring-[#6742FA] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTopicMutation.isPending ? "Creating..." : "Create Topic"}
            </button>
          </div>
        </form>

        {createTopicMutation.isError && (
          <div className="px-6 pb-4">
            <div className="bg-[#6742FA0D] border border-[#6742FA33] rounded-md p-3">
              <p className="text-sm text-[#6742FA]">
                Error: {createTopicMutation.error instanceof Error ? createTopicMutation.error.message : "Failed to create topic"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTopicModal;