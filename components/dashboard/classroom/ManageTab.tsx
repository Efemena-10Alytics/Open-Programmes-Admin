"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import api from "../../../lib/api";
import CreateTopicModal from "./CreateTopicModal";
import AddSubItemModal from "./AddSubItemModal";
import BatchAddItemModal from "./BatchAddItemModal";
import BatchCreateTopicModal from "./BatchCreateTopicModal";
import AttendanceModal from "./AttendanceModal";
import ManageItemModal from "./ManageItemModal";
import AddLiveClassModal from "./AddLiveClassModal";
import EditAssignmentModal from "./EditAssignmentModal";
import ConfirmationModal from "./ConfirmationModal";
import { toast } from "sonner";

interface ManageTabProps {
  classroomData: any;
  initialAssignmentId?: string | null;
  onPlayVideo?: (url: string) => void;
  onOpenMaterial?: (material: any) => void;
}

const ManageTab: React.FC<ManageTabProps> = ({ classroomData, initialAssignmentId, onPlayVideo, onOpenMaterial }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [showBatchCreateTopic, setShowBatchCreateTopic] = useState(false);
  const [showAddSubItem, setShowAddSubItem] = useState<string | null>(null);
  const [showAddLiveClass, setShowAddLiveClass] = useState(false);
  const [showBatchAddItem, setShowBatchAddItem] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(classroomData.cohortId);
  const [activeTab, setActiveTab] = useState<"content" | "announcements" | "attendance" | "batch" | "students">("content");
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [selectedManageItem, setSelectedManageItem] = useState<{ id: string; type: string; title: string } | null>(
    initialAssignmentId ? { id: initialAssignmentId, type: "assignment", title: "Assignment Details" } : null
  );
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
    showInput?: boolean;
    inputValue?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (initialAssignmentId) {
      setSelectedManageItem({ id: initialAssignmentId, type: "assignment", title: "Assignment Details" }); // Note: Title might be generic here until fetched
    }
  }, [initialAssignmentId]);

  const { data: allCohorts, isLoading: cohortsLoading } = useQuery({
    queryKey: ["adminCohorts"],
    queryFn: async () => {
      const response = await api.get("/api/cohorts");
      return response.data.data;
    },
  });

  const cohorts = useMemo(() => {
    if (!allCohorts) return [];
    const userRole = (user as any)?.role;
    if (userRole === "ADMIN") return allCohorts;
    if (userRole === "COURSE_ADMIN") {
      const purchasedCourseIds = (user as any)?.course_purchased?.map((cp: any) => cp.courseId) || [];
      return allCohorts.filter((cohort: any) => purchasedCourseIds.includes(cohort.courseId));
    }
    return [];
  }, [allCohorts, user]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  const selectedCohortData = cohorts?.find((c: any) => c.id === selectedCohort);
  const selectedCohortCourseId = selectedCohortData?.cohortCourses[0]?.id || "";

  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ["manageTopics", selectedCohort],
    queryFn: async () => {
      const response = await api.get(`/api/classroom/${selectedCohort}/topics`);
      return response.data;
    },
    enabled: !!selectedCohort,
  });

  const topics = topicsData?.topics;
  const unassignedItems = topicsData?.unassignedItems;

  const pinTopicMutation = useMutation({
    mutationFn: async ({
      topicId,
      pinned,
    }: {
      topicId: string;
      pinned: boolean;
    }) => {
      const response = await api.patch(`/api/classroom/topics/${topicId}`, {
        isPinned: pinned,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageTopics", selectedCohort],
      });
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (topicId: string) => {
      await api.delete(`/api/classroom/topics/${topicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageTopics", selectedCohort],
      });
    },
  });

  const deleteSubItemMutation = useMutation({
    mutationFn: async ({ type, id, reason }: { type: string; id: string; reason?: string }) => {
      const endpoint = type === "liveClasses" ? `/api/live-class/${id}` : `/api/classroom/${type}/${id}`;
      await api.delete(endpoint, { 
        data: { reason }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageTopics", selectedCohort],
      });
      toast.success("Item deleted successfully");
    },
  });

  const toggleAssignmentLockMutation = useMutation({
    mutationFn: async ({ assignmentId, currentLocked }: { assignmentId: string; currentLocked: boolean }) => {
      const response = await api.patch(`/api/assignments/${assignmentId}`, {
        isLocked: !currentLocked,
      });
      return response.data;
    },
    onSuccess: (_, { currentLocked }) => {
      queryClient.invalidateQueries({ queryKey: ["manageTopics", selectedCohort] });
      toast.success(currentLocked ? "Assignment unlocked" : "Assignment locked");
    },
    onError: () => {
      toast.error("Failed to update assignment lock status");
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (announcementData: { title: string; content: string }) => {
      const response = await api.post(`/api/stream/${selectedCohort}`, {
        ...announcementData,
        authorId: classroomData.course?.instructorId || classroomData.authorId || classroomData.instructorId || ""
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streamActivities", selectedCohort] });
      setNewAnnouncement({ title: "", content: "" });
      toast.success("Announcement posted successfully!");
    },
  });

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnouncement.title.trim() && newAnnouncement.content.trim()) {
      createAnnouncementMutation.mutate(newAnnouncement);
    }
  };

  const navItems = [
    { id: "content", label: "Course Content", icon: "📚", color: "purple" },
    { id: "announcements", label: "Announcements", icon: "📢", color: "blue" },
    { id: "attendance", label: "Attendance Tracker", icon: "📊", color: "indigo" },
    { id: "students", label: "Students", icon: "👥", color: "green" },
    ...(user?.role === "ADMIN" ? [{ id: "batch", label: "Batch Operations", icon: "⚙️", color: "orange" }] : []),
  ];

  const students = selectedCohortData?.users || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-4 sticky top-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Classroom Management</h3>
          </div>

          <div className="p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md transition-all text-sm ${activeTab === item.id
                  ? `bg-[#6742FA] text-white shadow-sm`
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            <div className="my-2 border-t border-gray-100"></div>

            <button
              onClick={() => setShowAddLiveClass(true)}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-md transition-all text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
            >
              <span className="text-lg">📡</span>
              <span>Add Live Class</span>
            </button>
          </div>
        </div>

        {/* Cohort Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Cohort</p>
          {cohortsLoading ? (
            <div className="w-full h-10 bg-gray-50 rounded animate-pulse"></div>
          ) : (
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6742FA] truncate"
            >
              {cohorts?.map((cohort: any) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name} • {cohort.course?.title || "Unknown Course"}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full space-y-6">
        {/* Section Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              {activeTab === "content" && "Manage your topics, lectures, and resources."}
              {activeTab === "announcements" && "Broadcast messages to your students."}
              {activeTab === "attendance" && "Track attendance for live class sessions."}
              {activeTab === "students" && "View and manage students in this cohort."}
              {activeTab === "batch" && "Apply changes across multiple cohorts."}
            </p>
          </div>

          {activeTab === "content" && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddSubItem("none")}
                className="bg-[#6742FA] text-white px-4 py-2 rounded-md hover:bg-[#5235c7] font-semibold text-sm transition-colors"
              >
                + Add Item
              </button>
              <button
                onClick={() => setShowCreateTopic(true)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-semibold text-sm transition-colors"
              >
                + New Topic
              </button>
            </div>
          )}
        </div>

        {/* Content Panels */}
        <div className="min-h-[400px]">
          {activeTab === "content" && (
            <div className="space-y-6">
              {/* Unassigned Items Section */}
              {unassignedItems && (unassignedItems.assignments.length > 0 || unassignedItems.materials.length > 0 || unassignedItems.recordings.length > 0 || unassignedItems.liveClasses.length > 0) && (
                <div className="bg-white rounded-lg shadow-sm border border-[#6742FA33]">
                  <div className="bg-[#6742FA0D] px-6 py-3 border-b border-[#6742FA33] flex items-center justify-between">
                    <h3 className="font-semibold text-[#3b2691]">Uncategorized Content</h3>
                    <span className="text-xs text-[#6742FA] font-medium bg-white px-2 py-0.5 rounded border border-[#6742FA1A] uppercase">
                      Draft / Priority
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      ...unassignedItems.assignments.map((i: any) => ({ ...i, type: "assignment" })),
                      ...unassignedItems.materials.map((i: any) => ({ ...i, type: "material" })),
                      ...unassignedItems.recordings.map((i: any) => ({ ...i, type: "recording" })),
                      ...unassignedItems.liveClasses.map((i: any) => ({ ...i, type: "live-class" })),
                    ].map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => item.type === "assignment" && setSelectedManageItem({ id: item.id, type: item.type, title: item.title || "" })}
                        className={`bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-transparent transition-all group relative ${item.type === "assignment" ? "cursor-pointer hover:border-[#6742FA33]" : ""}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {item.type === "assignment" ? "📝" : item.type === "material" ? "📎" : item.type === "recording" ? "🎥" : "📡"}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                              {item.type === "assignment" && (
                                <span className="text-[#6742FA] font-bold">View Submissions & Grade</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === item.id ? null : item.id);
                            }}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all shadow-sm"
                          >
                            ⋮
                          </button>

                          {openMenuId === item.id && (
                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in duration-100">
                              {item.type === "assignment" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedManageItem({ id: item.id, type: item.type, title: item.title || "" });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                >
                                  <span>👁️</span>
                                  <span>View Submissions</span>
                                </button>
                              )}
                              {item.type === "assignment" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAssignmentLockMutation.mutate({ assignmentId: item.id, currentLocked: !!item.isLocked });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                >
                                  <span>{item.isLocked ? "🔓" : "🔒"}</span>
                                  <span>{item.isLocked ? "Unlock Submissions" : "Lock Submissions"}</span>
                                </button>
                              )}
                              {item.type === "assignment" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAssignmentId(item.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                >
                                  <span>✏️</span>
                                  <span>Edit Details</span>
                                </button>
                              )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const isLive = item.type === "live-class" || item.type === "live-session";
                                    setConfirmModal({
                                      isOpen: true,
                                      title: `Delete ${isLive ? "Live Class" : "Item"}?`,
                                      message: `Are you sure you want to delete this ${isLive ? "live class" : "item"}? This action cannot be undone.`,
                                      type: "danger",
                                      showInput: isLive,
                                      inputValue: "",
                                      onConfirm: () => {
                                        deleteSubItemMutation.mutate({ 
                                          type: item.type === "live-class" ? "liveClasses" : item.type === "assignment" ? "assignments" : item.type === "material" ? "materials" : "recordings", 
                                          id: item.id,
                                          reason: confirmModal.inputValue || ""
                                        });
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                      }
                                    });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                                >
                                  <span>🗑️</span>
                                  <span>Delete Item</span>
                                </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {topicsLoading ? (
                  <div className="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="inline-block w-6 h-6 border-2 border-[#6742FA] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-gray-400 mt-3">Loading topics...</p>
                  </div>
                ) : topics?.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-4xl mx-auto mb-4 opacity-50">📚</div>
                    <h3 className="text-lg font-bold text-gray-900">No content found</h3>
                    <p className="text-gray-500 text-sm mt-1">Select a different cohort or create your first topic.</p>
                  </div>
                ) : (
                  topics?.map((topic: any) => (
                    <div key={topic.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      {/* Topic Bar */}
                      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{topic.title}</h3>
                          {topic.isPinned && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">Pinned</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowAddSubItem(topic.id)}
                            className="text-[11px] font-bold text-[#6742FA] bg-[#6742FA0D] px-2.5 py-1 rounded hover:bg-[#6742FA1A] transition-colors"
                          >
                            + Add Item
                          </button>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === topic.id ? null : topic.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                            >
                              ⋮
                            </button>

                            {openMenuId === topic.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-10">
                                <button
                                  onClick={() => {
                                    pinTopicMutation.mutate({ topicId: topic.id, pinned: !topic.isPinned });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <span>{topic.isPinned ? "📍" : "📌"}</span>
                                  <span>{topic.isPinned ? "Unpin Topic" : "Pin Topic"}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "Delete Topic?",
                                      message: "Are you sure you want to delete this topic and all its contents? This action cannot be undone.",
                                      type: "danger",
                                      onConfirm: () => {
                                        deleteTopicMutation.mutate(topic.id);
                                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                      }
                                    });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <span>🗑️</span>
                                  <span>Delete Topic</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          ...topic.assignments.map((i: any) => ({ ...i, type: "assignment" })),
                          ...topic.classMaterials.map((i: any) => ({ ...i, type: "material" })),
                          ...topic.classRecordings.map((i: any) => ({ ...i, type: "recording" })),
                          ...(topic.LiveClass || []).map((i: any) => ({ ...i, type: "live-session" })),
                        ].length === 0 ? (
                          <div className="col-span-full py-4 text-center text-xs text-gray-400 font-medium italic">
                            No items in this topic.
                          </div>
                        ) : (
                          [
                            ...topic.assignments.map((i: any) => ({ ...i, type: "assignment" })),
                            ...topic.classMaterials.map((i: any) => ({ ...i, type: "material" })),
                            ...topic.classRecordings.map((i: any) => ({ ...i, type: "recording" })),
                            ...(topic.LiveClass || []).map((i: any) => ({ ...i, type: "live-session" })),
                          ].map((item: any) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (item.type === "assignment") {
                                  setSelectedManageItem({ id: item.slug || item.id, type: item.type, title: item.title || "" });
                                } else if (item.type === "material") {
                                  onOpenMaterial?.(item);
                                }
                              }}
                              className={`flex items-center justify-between p-3 rounded-md border border-transparent transition-all group relative ${item.type === "assignment" || item.type === "material" ? "cursor-pointer hover:bg-gray-50 hover:border-gray-100" : ""}`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg opacity-80">{item.type === "assignment" ? "📝" : item.type === "material" ? "📎" : item.type === "recording" ? "🎥" : "📡"}</span>
                                <div>
                                  <p className="text-sm font-semibold text-gray-700">{item.title}</p>
                                  {item.type === "assignment" && (
                                    <p className="text-[10px] text-[#6742FA] font-bold uppercase">View Submissions & Grade</p>
                                  )}
                                </div>
                              </div>

                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === item.id ? null : item.id);
                                  }}
                                  className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
                                >
                                  ⋮
                                </button>

                                {openMenuId === item.id && (
                                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-10">
                                    {item.type === "assignment" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedManageItem({ id: item.slug || item.id, type: item.type, title: item.title || "" });
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <span>👁️</span>
                                        <span>View Submissions</span>
                                      </button>
                                    )}
                                    {item.type === "assignment" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleAssignmentLockMutation.mutate({ assignmentId: item.id, currentLocked: !!item.isLocked });
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <span>{item.isLocked ? "🔓" : "🔒"}</span>
                                        <span>{item.isLocked ? "Unlock Submissions" : "Lock Submissions"}</span>
                                      </button>
                                    )}
                                    {item.type === "assignment" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingAssignmentId(item.id);
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                      >
                                        <span>✏️</span>
                                        <span>Edit Details</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const isLive = item.type === "live-session" || item.type === "live-class";
                                        setConfirmModal({
                                          isOpen: true,
                                          title: `Delete ${isLive ? "Live Class" : "Item"}?`,
                                          message: `Are you sure you want to delete this ${isLive ? "live class" : "item"}? This action cannot be undone.`,
                                          type: "danger",
                                          showInput: isLive,
                                          inputValue: "",
                                          onConfirm: () => {
                                            deleteSubItemMutation.mutate({ 
                                              type: item.type === "live-session" ? "liveClasses" : item.type === "assignment" ? "assignments" : item.type === "material" ? "materials" : "recordings", 
                                              id: item.id,
                                              reason: confirmModal.inputValue || ""
                                            });
                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                          }
                                        });
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                      <span>🗑️</span>
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-3xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Post Announcement</h3>
                <p className="text-sm text-gray-500">Your announcement will be sent to the selected cohort&apos;s stream.</p>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Heading</label>
                  <input
                    type="text"
                    placeholder="E.g. Class Update"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 font-medium text-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                  <textarea
                    placeholder="Share something with your students..."
                    rows={5}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#6742FA] font-medium text-sm transition-all resize-none"
                    required
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={createAnnouncementMutation.isPending}
                    className="bg-[#6742FA] text-white px-8 py-2 rounded-md hover:bg-[#5235c7] font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {createAnnouncementMutation.isPending ? "Posting..." : "Post Announcement"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Live Session Attendance</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Access the interactive attendance tracker to view participation metrics for all live sessions.
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowAttendance(true)}
                    className="flex-1 bg-[#6742FA] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#5235c7] transition-colors"
                  >
                    Open Tracker
                  </button>
                  <button
                    onClick={() => setShowAddLiveClass(true)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-50 transition-colors"
                  >
                    New Session
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg border border-purple-100 p-6 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#3b2691]">Engagement Overview</h3>
                  <p className="text-sm text-[#452da6] font-medium">
                    Attendance is automatically tracked when students click on live class links in their classroom feed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Enrolled Students ({students.length})</h3>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    Active: {students.filter((s: any) => !s.user.inactive).length}
                  </span>
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    Suspended: {students.filter((s: any) => s.user.inactive).length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Joined At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                          No students enrolled in this cohort yet.
                        </td>
                      </tr>
                    ) : (
                      students.map((enrollment: any) => (
                        <tr key={enrollment.user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-full bg-[#6742FA1A] border border-[#6742FA33] flex items-center justify-center text-[#5235c7] font-bold text-sm">
                                {enrollment.user.image ? (
                                  <img src={enrollment.user.image} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  enrollment.user.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <p className="font-bold text-gray-900 text-sm">{enrollment.user.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                            {enrollment.user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${!enrollment.user.inactive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}>
                              {!enrollment.user.inactive ? "Active" : "Suspended"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-gray-500 font-medium">
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "batch" && user?.role === "ADMIN" && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Batch Operations</h3>
                <p className="text-sm text-gray-500">Apply organizational changes to multiple cohorts simultaneously.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowBatchCreateTopic(true)}
                  className="flex-col items-start p-6 rounded-lg bg-gray-50 border border-gray-100 hover:border-[#6742FA33] hover:bg-white transition-all group shadow-sm hover:shadow"
                >
                  <span className="text-2xl mb-4 group-hover:scale-110 transition-transform">📋</span>
                  <p className="font-bold text-gray-900 text-sm mb-1">Global Topic Creation</p>
                  <p className="text-xs text-gray-500 font-medium italic">Create a new topic in every existing cohort.</p>
                </button>

                <button
                  onClick={() => setShowBatchAddItem(true)}
                  className="flex flex-col items-start p-6 rounded-lg bg-gray-50 border border-gray-100 hover:border-purple-200 hover:bg-white transition-all group shadow-sm hover:shadow"
                >
                  <span className="text-2xl mb-4 group-hover:scale-110 transition-transform">➕</span>
                  <p className="font-bold text-gray-900 text-sm mb-1">Bulk Content Upload</p>
                  <p className="text-xs text-gray-500 font-medium italic">Add recordings or materials to multiple cohorts.</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      {/* Modals */}
      {showBatchCreateTopic && (
        <BatchCreateTopicModal
          isOpen={showBatchCreateTopic}
          onClose={() => setShowBatchCreateTopic(false)}
          onSuccess={() => {
            setShowBatchCreateTopic(false);
            queryClient.invalidateQueries({
              queryKey: ["manageTopics"],
            });
          }}
          cohorts={cohorts || []}
        />
      )}

      {showBatchAddItem && (
        <BatchAddItemModal
          isOpen={showBatchAddItem}
          onClose={() => setShowBatchAddItem(false)}
          onSuccess={() => {
            setShowBatchAddItem(false);
            queryClient.invalidateQueries({
              queryKey: ["manageTopics"],
            });
          }}
        />
      )}

      {showCreateTopic && (
        <CreateTopicModal
          cohortId={selectedCohort}
          onClose={() => setShowCreateTopic(false)}
          onSuccess={() => {
            setShowCreateTopic(false);
            queryClient.invalidateQueries({
              queryKey: ["manageTopics", selectedCohort],
            });
          }}
        />
      )}

      {showAddSubItem && (
        <AddSubItemModal
          topicId={showAddSubItem === "none" ? "" : showAddSubItem}
          initialType="assignment"
          cohortId={selectedCohort}
          cohortCourseId={cohorts?.find((c: any) => c.id === selectedCohort)?.cohortCourses[0]?.id || ""}
          onClose={() => setShowAddSubItem(null)}
          onSuccess={() => {
            setShowAddSubItem(null);
            queryClient.invalidateQueries({
              queryKey: ["manageTopics", selectedCohort],
            });
          }}
        />
      )}

      <AddLiveClassModal
        isOpen={showAddLiveClass}
        onClose={() => setShowAddLiveClass(false)}
        cohortId={selectedCohort}
        cohortCourseId={selectedCohortCourseId}
      />

      {showAttendance && (
        <AttendanceModal
          cohortId={selectedCohort}
          onClose={() => setShowAttendance(false)}
        />
      )}

      {selectedManageItem && (
        <ManageItemModal
          item={selectedManageItem}
          onClose={() => setSelectedManageItem(null)}
        />
      )}

      {editingAssignmentId && (
        <EditAssignmentModal
          assignmentId={editingAssignmentId}
          onClose={() => setEditingAssignmentId(null)}
          onSuccess={() => {
            setEditingAssignmentId(null);
            queryClient.invalidateQueries({ queryKey: ["manageTopics", selectedCohort] });
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        showInput={confirmModal.showInput}
        inputValue={confirmModal.inputValue}
        onInputChange={(val) => setConfirmModal(prev => ({ ...prev, inputValue: val }))}
        inputPlaceholder="Reason for cancellation (optional, will be sent to students)"
        isLoading={deleteSubItemMutation.isPending || deleteTopicMutation.isPending}
      />

      {/* Loading States */}
      {(pinTopicMutation.isPending ||
        deleteTopicMutation.isPending ||
        deleteSubItemMutation.isPending) && (
          <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        )}
    </div>
  );
};

export default ManageTab;
