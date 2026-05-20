"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

interface EditAssignmentModalProps {
  assignmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  assignmentId,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    points: "",
  });

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      const response = await api.get(`/api/assignments/${assignmentId}`);
      return response.data.assignment;
    },
    enabled: !!assignmentId,
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title || "",
        description: assignment.description || "",
        instructions: assignment.instructions || "",
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : "",
        points: assignment.points?.toString() || "100",
      });
    }
  }, [assignment]);

  const updateAssignmentMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/assignments/${assignmentId}`, {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        points: parseInt(formData.points) || 100,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manageTopics"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      toast.success("Assignment updated successfully");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update assignment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    updateAssignmentMutation.mutate();
  };

  const minDateTime = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📝</span> Edit Assignment
            </h2>
            <p className="text-xs text-gray-500 font-medium">Update assignment details and settings</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#6742FA] animate-spin" />
            <p className="text-sm font-bold text-gray-400">Loading details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Assignment Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6742FA]/20 focus:border-[#6742FA] outline-none transition-all font-semibold text-gray-900 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                Instructions
              </label>
              <textarea
                rows={5}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6742FA]/20 focus:border-[#6742FA] outline-none transition-all font-medium text-sm text-gray-700 shadow-sm resize-none"
                placeholder="What should students do?"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  min={minDateTime}
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6742FA]/20 focus:border-[#6742FA] outline-none transition-all font-semibold text-sm text-gray-700 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Max Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6742FA]/20 focus:border-[#6742FA] outline-none transition-all font-semibold text-sm text-gray-700 shadow-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateAssignmentMutation.isPending}
                className="bg-[#6742FA] text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-lg hover:bg-[#5235c7] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {updateAssignmentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditAssignmentModal;
