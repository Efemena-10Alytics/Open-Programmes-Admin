"use client";
import React from "react";
import AssignmentSubmissions from "./AssignmentSubmissions";

interface ManageItemModalProps {
  item: { id: string; type: string; title: string };
  onClose: () => void;
}

const ManageItemModal: React.FC<ManageItemModalProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>{item.type === "assignment" ? "📝" : item.type === "material" ? "📎" : item.type === "recording" ? "🎥" : "📡"}</span>
              {item.title || `Manage ${item.type.charAt(0) + item.type.slice(1).replace("-", " ")}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
          {item.type === "assignment" && (
            <div className="p-0 flex-1 flex flex-col">
              <AssignmentSubmissions assignmentId={item.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageItemModal;
