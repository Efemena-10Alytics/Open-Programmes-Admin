// components/assignments/AssignmentSubmissions.tsx (Updated for Next.js App Router)
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import api from "../../../lib/api";

interface Submission {
  id: string;
  content?: string;
  fileUrl?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: {
    id: string;
    name: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  assignment?: {
    isLocked: boolean;
  };
}

interface QuizSubmission {
  id: string;
  submittedAt: string;
  totalScore: number;
  maxScore: number;
  gradedAt?: string;
  gradedById?: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  assignmentQuizAnswers: any[];
  assignment?: {
    isLocked: boolean;
  };
}

const TableHeader = ({ isQuiz }: { isQuiz: boolean }) => (
  <thead>
    <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
      <th className="px-6 py-4">Student</th>
      <th className="px-6 py-4">Submitted At</th>
      <th className="px-6 py-4">{isQuiz ? "Score" : "Grade"}</th>
      <th className="px-6 py-4">Status</th>
      <th className="px-6 py-4">Actions</th>
    </tr>
  </thead>
);

const UserCell = ({ student }: { student: any }) => (
  <td className="px-6 py-4 whitespace-nowrap">
    <div className="flex items-center">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#6742FA] flex items-center justify-center text-white font-bold text-xs">
        {student.name.charAt(0)}
      </div>
      <div className="ml-4">
        <p className="text-sm font-bold text-gray-900">{student.name}</p>
        <p className="text-xs text-gray-500">{student.email}</p>
      </div>
    </div>
  </td>
);

const DateCell = ({ date }: { date: string }) => (
  <td className="px-6 py-4 whitespace-nowrap">
    <span className="text-sm text-gray-600">
      {new Date(date).toLocaleString()}
    </span>
  </td>
);

const GradeCell = ({ grade, maxScore, isQuiz }: any) => (
  <td className="px-6 py-4 whitespace-nowrap">
    <span className={`text-sm font-bold ${grade !== null ? "text-[#6742FA]" : "text-gray-400"}`}>
      {grade !== null ? `${grade}${isQuiz ? '/' + maxScore : ''}` : "Not Graded"}
    </span>
  </td>
);

const StatusBadge = ({ text, color, bg }: any) => (
  <td className="px-6 py-4 whitespace-nowrap">
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${color} ${bg} shadow-sm border border-current opacity-70`}>
      {text}
    </span>
  </td>
);

const ActionsCell = ({ submission, onView }: { submission: any; onView: (s: any) => void }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
    <button
      onClick={() => onView(submission)}
      className="text-[#6742FA] hover:text-[#452da6] mr-3 font-bold"
    >
      👁️ View
    </button>
  </td>
);


// Helper function
const getSubmissionStatus = (submission: any, assignment: any) => {
  const grade = submission.grade !== undefined && submission.grade !== null ? submission.grade : submission.totalScore;
  const isLate = assignment?.dueDate && new Date(submission.submittedAt) > new Date(assignment.dueDate);
  
  if (grade !== undefined && grade !== null) {
     return { 
       text: isLate ? "Graded (Late)" : "Graded", 
       color: "text-green-600", 
       bg: "bg-green-50" 
     };
  }
  return { 
    text: isLate ? "Pending (Late)" : "Pending", 
    color: isLate ? "text-red-600" : "text-yellow-700", 
    bg: isLate ? "bg-red-50" : "bg-yellow-50" 
  };
};

// Modal components
const SubmissionDetailModal = ({ submission, assignment, onGrade, isGrading, onToggleLock, onClose }: any) => {
  const [grade, setGrade] = useState(submission.grade || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grade === "") {
      alert("Please enter a grade");
      return;
    }
    onGrade({ submissionId: submission.id, grade: parseInt(grade), feedback });
  };

  return (
    <div className="absolute inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-[#6742FA] hover:text-[#5235c7] font-bold text-sm"
        >
          <span>←</span>
          <span>Back to Submissions</span>
        </button>
        <h2 className="text-lg font-bold text-gray-900">
          Submission: {submission.student.name}
        </h2>
        <div className="w-24"></div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Lock Status Banner */}
          {assignment.isLocked && (
            <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3 text-red-700">
                <span className="text-xl">🔒</span>
                <div>
                  <p className="text-sm font-bold">Submissions are Locked</p>
                  <p className="text-xs">Students can no longer submit or edit their responses for this assignment.</p>
                </div>
              </div>
              <button
                onClick={onToggleLock}
                className="bg-red-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-red-700 transition"
              >
                Unlock Now
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">Submitted Content</h3>
                </div>
                <div className="p-8">
                  {submission.content ? (
                    <div className="prose prose-indigo max-w-none">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">{submission.content}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm text-center py-6">No text content provided by student.</p>
                  )}
                </div>
              </section>

              {submission.fileUrl && (
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">Attached Files</h3>
                  </div>
                  <div className="p-6">
                    <div className="p-4 border border-gray-100 bg-gray-50 rounded-lg flex items-center justify-between group hover:border-[#6742FA] transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm">
                          📁
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {submission.fileUrl.split('/').pop()?.split('?')[0] || "Submission Attachment"}
                          </p>
                          <p className="text-[10px] text-gray-500">Uploaded on {new Date(submission.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Link
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#6742FA] text-white px-5 py-1.5 rounded text-xs font-bold shadow-sm hover:bg-[#5235c7] transition-all"
                      >
                        View File
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Grading */}
            <div className="lg:col-span-1">
              <div className="sticky top-0 space-y-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Grading Panel</h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${submission.grade !== null ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {submission.grade !== null ? 'Graded' : 'Needs Review'}
                    </span>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Award Points (Max: {assignment.points})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          max={assignment.points}
                          min="0"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded focus:ring-0 focus:border-[#6742FA] transition-all text-xl font-bold text-[#6742FA]"
                          placeholder="0"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                          / {assignment.points}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Instructor Feedback
                      </label>
                      <textarea
                        rows={6}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded focus:border-[#6742FA] bg-white transition-all resize-none text-xs leading-relaxed"
                        placeholder="Share constructive feedback..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGrading}
                      className="w-full bg-[#6742FA] text-white py-3 rounded-md font-bold text-sm shadow-md hover:bg-[#5235c7] transition-all disabled:opacity-50"
                    >
                      {isGrading ? "Saving..." : (submission.grade !== null ? "Update Grade" : "Finalize Score")}
                    </button>
                  </form>
                </div>

                  <button
                    onClick={onToggleLock}
                    className={`w-full py-2.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-2 ${
                      assignment.isLocked 
                        ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" 
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{assignment.isLocked ? "🔓" : "🔒"}</span>
                    <span>{assignment.isLocked ? "Unlock Submission" : "Lock Submission"}</span>
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizSubmissionDetailModal = ({ submission, assignment, onGrade, isGrading, onToggleLock, onClose }: any) => {
  const [grade, setGrade] = useState(submission.totalScore || 0);
  const [feedback, setFeedback] = useState(submission.feedback || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGrade({ submissionId: submission.id, grade: parseInt(grade), feedback });
  };

  return (
    <div className="absolute inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <button 
          onClick={onClose}
          className="flex items-center space-x-2 text-[#6742FA] hover:text-[#5235c7] font-bold text-sm"
        >
          <span>←</span>
          <span>Back to Submissions</span>
        </button>
        <h2 className="text-lg font-bold text-gray-900">
          Quiz Results: {submission.student.name}
        </h2>
        <div className="w-24"></div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Lock Status Banner */}
          {submission.assignment?.isLocked && (
            <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-lg flex items-center space-x-3 text-red-700">
              <span className="text-xl">🔒</span>
              <div>
                <p className="text-sm font-bold">Quiz Submissions are Locked</p>
                <p className="text-xs">Students can no longer take this quiz.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Score Overview Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Quiz Performance</h3>
                    <p className="text-xs text-gray-500">Submission results for {submission.student.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#6742FA]">
                      {submission.totalScore}<span className="text-lg text-gray-300">/{submission.maxScore}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center space-x-2">
                    <span>📅</span>
                    <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span>📈</span>
                    <span>Accuracy: {Math.round((submission.totalScore / submission.maxScore) * 100)}%</span>
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight ml-1">Answer Logs</h3>
                {submission.assignmentQuizAnswers?.map((answer: any, index: number) => (
                  <div 
                    key={answer.id} 
                    className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 text-sm font-bold text-gray-900">
                        <span className="mr-2 text-gray-400">{index + 1}.</span>
                        {answer.assignmentQuizQuestion?.question}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${
                        answer.isCorrect 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {answer.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div className={`p-3 rounded border ${answer.isCorrect ? "bg-green-50/30 border-green-100" : "bg-red-50/30 border-red-100 text-red-700"}`}>
                        <span className="font-bold opacity-60 mr-2 uppercase text-[9px]">Student Choice:</span>
                        {answer.selectedAssignmentQuizOption?.text}
                      </div>
                      {!answer.isCorrect && (
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded">
                          <span className="font-bold opacity-60 mr-2 uppercase text-[9px]">Correct Answer:</span>
                          {answer.assignmentQuizQuestion?.assignmentQuizOptions?.find((opt: any) => opt.isCorrect)?.text}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Score Override */}
            <div className="lg:col-span-1">
              <div className="sticky top-0 bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-gray-900 text-sm italic">Manual Score Override</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Points
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={grade}
                        onChange={(e) => setGrade(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded focus:ring-0 focus:border-[#6742FA] text-xl font-bold text-[#6742FA]"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                        / {submission.maxScore}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Adjustment Notes
                    </label>
                    <textarea
                      rows={5}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:ring-0 focus:border-[#6742FA] text-xs"
                      placeholder="Why is this override being applied?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGrading}
                    className="w-full bg-[#6742FA] text-white py-3 rounded font-bold text-sm hover:bg-[#5235c7] transition disabled:opacity-50 shadow-sm"
                  >
                    {isGrading ? "Saving..." : "Apply Changes"}
                  </button>
                </form>

                <button
                  onClick={onToggleLock}
                  className={`w-full py-2.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center space-x-2 ${
                    assignment.isLocked 
                      ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" 
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{assignment.isLocked ? "🔓" : "🔒"}</span>
                  <span>{assignment.isLocked ? "Unlock Submission" : "Lock Quiz"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AssignmentSubmissionsProps {
  assignmentId: string;
}

const AssignmentSubmissions = ({ assignmentId }: AssignmentSubmissionsProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedQuizSubmission, setSelectedQuizSubmission] = useState<QuizSubmission | null>(null);

  // Fetch assignment details to check type
  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: async () => {
      const response = await api.get(`/api/assignments/${assignmentId}`);
      return response.data.assignment;
    },
    enabled: !!assignmentId,
  });

  // Fetch regular submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["assignmentSubmissions", assignmentId],
    queryFn: async () => {
      const response = await api.get(`/api/assignments/${assignmentId}/submissions`);
      return response.data.submissions;
    },
    enabled: !!assignmentId && !!assignment && assignment?.type !== "QUIZ",
  });

  // Fetch quiz submissions
  const { data: quizSubmissions, isLoading: quizSubmissionsLoading } = useQuery({
    queryKey: ["assignmentQuizSubmissions", assignmentId],
    queryFn: async () => {
      const response = await api.get(`/api/assignments/${assignmentId}/quiz-submissions`);
      return response.data.submissions;
    },
    enabled: !!assignmentId && !!assignment && assignment?.type === "QUIZ",
  });

  // Grade regular assignment mutation
  const gradeSubmissionMutation = useMutation({
    mutationFn: async (data: { submissionId: string; grade: number; feedback: string }) => {
      const response = await api.post(
        `/api/assignments/submissions/${data.submissionId}/grade`,
        { ...data, gradedById: user?.id }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignmentSubmissions", assignmentId] });
      setSelectedSubmission(null);
    },
  });

  // Quiz grading mutation
  const gradeQuizMutation = useMutation({
    mutationFn: async (data: { submissionId: string; grade: number; feedback: string }) => {
      const response = await api.post(
        `/api/assignments/quiz-submissions/${data.submissionId}/grade`,
        { ...data, gradedById: user?.id }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignmentQuizSubmissions", assignmentId] });
      setSelectedQuizSubmission(null);
    },
  });

  const isQuizAssignment = assignment?.type === "QUIZ";
  const isLoading = assignmentLoading || (isQuizAssignment ? quizSubmissionsLoading : submissionsLoading);
  const displaySubmissions = (isQuizAssignment ? quizSubmissions : submissions) || [];

  const toggleLockMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/api/assignments/${assignmentId}`, {
        isLocked: !assignment.isLocked,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["assignmentSubmissions", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["assignmentQuizSubmissions", assignmentId] });
      toast.success(assignment.isLocked ? "Assignment unlocked" : "Assignment locked");
    },
    onError: () => {
      toast.error("Failed to update assignment status");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-[#6742FA] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[#6742FA] animate-pulse">Loading Submissions...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-[400px] bg-white rounded-xl flex items-center justify-center border border-gray-100 italic">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-400 mb-2">Assignment Not Found</h1>
          <p className="text-gray-300 text-sm mb-4">The requested assignment details (ID: {assignmentId}) could not be retrieved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-200px)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Assignment Details Banner */}
      <div className="px-6 py-4 bg-[#6742FA08] border-b border-[#6742FA1A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-sm font-black text-[#452da6] uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>📋</span> Assignment Instructions
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">
              {assignment.instructions || assignment.description || "No specific instructions provided for this assignment."}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-3 rounded-lg border border-[#6742FA1A] shadow-sm flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Points</span>
              <span className="text-sm font-black text-[#6742FA]">{assignment.points || 0}</span>
           </div>
           <div className="bg-white p-3 rounded-lg border border-[#6742FA1A] shadow-sm flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Due Date</span>
              <span className="text-[11px] font-black text-gray-700">
                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No Due Date"}
              </span>
           </div>
        </div>
      </div>

      {/* Header with Stats */}
      <div className="px-6 py-6 border-b border-gray-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
               {assignment.title}
               {assignment.type === "QUIZ" && (
                 <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Quiz</span>
               )}
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium italic">
              Managing {displaySubmissions?.length || 0} student submissions
            </p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submission Status</span>
                <span className={`text-sm font-black ${assignment.isLocked ? "text-red-500" : "text-green-500"}`}>
                   {assignment.isLocked ? "LOCKED" : "ACTIVE"}
                </span>
             </div>
             <button
              onClick={() => toggleLockMutation.mutate()}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all shadow-sm ${
                assignment.isLocked 
                  ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" 
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{assignment.isLocked ? "🔓" : "🔒"}</span>
              <span>{assignment.isLocked ? "UNLOCK ALL" : "LOCK SUBMISSIONS"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto bg-white">
        {!displaySubmissions || displaySubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="text-5xl mb-4 opacity-20">📥</div>
            <p className="text-lg font-bold text-gray-400">No submissions found yet</p>
            <p className="text-sm text-gray-300">Student submissions will appear here once they start turning in work.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <TableHeader isQuiz={isQuizAssignment} />
            <tbody className="bg-white divide-y divide-gray-50">
              {displaySubmissions.map((submission: any) => {
                const status = getSubmissionStatus(submission, assignment);
                return (
                  <tr 
                    key={submission.id} 
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <UserCell student={submission.student} />
                    <DateCell date={submission.submittedAt} />
                    <GradeCell 
                      grade={isQuizAssignment ? submission.totalScore : submission.grade} 
                      maxScore={submission.maxScore}
                      isQuiz={isQuizAssignment} 
                    />
                    <StatusBadge {...status} />
                    <ActionsCell
                      submission={submission}
                      onView={() => isQuizAssignment ? setSelectedQuizSubmission(submission) : setSelectedSubmission(submission)}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Modals */}
        {selectedSubmission && (
          <SubmissionDetailModal
            submission={selectedSubmission}
            assignment={assignment}
            onGrade={gradeSubmissionMutation.mutate}
            isGrading={gradeSubmissionMutation.isPending}
            onToggleLock={() => toggleLockMutation.mutate()}
            onClose={() => setSelectedSubmission(null)}
          />
        )}

        {selectedQuizSubmission && (
          <QuizSubmissionDetailModal
            submission={selectedQuizSubmission}
            assignment={assignment}
            onGrade={gradeQuizMutation.mutate}
            isGrading={gradeQuizMutation.isPending}
            onToggleLock={() => toggleLockMutation.mutate()}
            onClose={() => setSelectedQuizSubmission(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmissions;
