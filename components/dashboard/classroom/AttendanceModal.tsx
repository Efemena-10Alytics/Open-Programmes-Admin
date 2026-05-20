"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";

interface AttendanceModalProps {
  cohortId: string;
  onClose: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ cohortId, onClose }) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const { data: classesResult, isLoading: classesLoading } = useQuery({
    queryKey: ["cohortLiveClasses", cohortId],
    queryFn: async () => {
      const response = await api.get(`/api/classroom/${cohortId}/live-classes`);
      return response.data;
    },
  });

  const { data: attendanceResult, isLoading: attendanceLoading } = useQuery({
    queryKey: ["liveClassAttendance", selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return null;
      const response = await api.get(`/api/classroom/live-class/${selectedClassId}/attendance`);
      return response.data;
    },
    enabled: !!selectedClassId,
  });

  const liveClasses = classesResult?.liveClasses || [];
  const attendance = attendanceResult?.attendance || [];
  const classDetail = attendanceResult?.liveClass;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] min-h-[600px] overflow-hidden flex flex-col border border-gray-200 animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              Attendance Tracker
            </h2>
            <p className="text-gray-500 text-xs font-medium">View student participation for live sessions</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Sidebar: List of Live Classes */}
          <div className="w-72 border-r border-gray-100 overflow-y-auto bg-gray-50/50">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Sessions</h3>
            </div>
            {classesLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-[#6742FA] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : liveClasses.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-400">
                <p className="text-xs font-medium">No sessions found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {liveClasses.map((lc: any) => (
                  <button
                    key={lc.id}
                    onClick={() => setSelectedClassId(lc.id)}
                    className={`w-full text-left p-4 transition-colors ${
                      selectedClassId === lc.id
                        ? "bg-[#6742FA0D] border-r-2 border-[#6742FA]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <p className={`font-bold text-sm mb-1 ${selectedClassId === lc.id ? "text-[#5235c7]" : "text-gray-900"}`}>
                      {lc.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                      <span>{new Date(lc.startTime).toLocaleDateString()}</span>
                      <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">
                        {lc._count.attendance} Present
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Content: Attendance Details */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            {!selectedClassId ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 border border-gray-100">
                  📈
                </div>
                <h3 className="text-base font-bold text-gray-900">Select a Session</h3>
                <p className="text-gray-500 text-sm mt-2">Choose a live class from the sidebar to view the attendance details.</p>
              </div>
            ) : attendanceLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#6742FA] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-[#6742FA] mt-4 uppercase tracking-widest">Loading...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-end justify-between border-b border-gray-100 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{classDetail?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Session Date: {new Date(classDetail?.startTime).toLocaleDateString()} at {new Date(classDetail?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="bg-[#6742FA] text-white px-6 py-3 rounded-lg shadow-sm text-center">
                    <p className="text-2xl font-bold leading-none">{attendance.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">Students Present</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</th>
                        <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Join Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendance.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                            No attendance records for this session.
                          </td>
                        </tr>
                      ) : (
                        attendance.map((record: any) => (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#6742FA1A] flex items-center justify-center text-[#5235c7] font-bold text-xs ring-1 ring-[#6742FA33] overflow-hidden">
                                  {record.user.image ? (
                                    <img src={record.user.image} alt={record.user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    record.user.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <p className="font-semibold text-gray-900 text-sm">{record.user.name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {record.user.email}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs font-bold text-[#6742FA] bg-[#6742FA0D] px-2 py-1 rounded border border-[#6742FA33]">
                                {new Date(record.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
