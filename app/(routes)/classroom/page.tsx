import { getServerSession } from "next-auth";
import { options } from "../../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { axiosInstance, setAuthToken } from "@/utils/axios";
import Link from "next/link";
import { 
  FileText, 
  Users, 
  Download, 
  Upload, 
  CheckCircle, 
  Clock,
  AlertCircle,
  BarChart3
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  dueDate?: string;
  points?: number;
  cohortCourse: {
    title: string;
    cohort: {
      name: string;
    };
  };
  _count: {
    submissions: number;
  };
  submissions: {
    id: string;
    submittedAt: string;
    grade?: number;
    student: {
      name: string;
      email: string;
    };
  }[];
}

export default async function ClassroomPage() {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    return redirect("/auth/signin");
  }

  if (session?.accessToken) {
    setAuthToken(session?.accessToken);
  }

  let assignments: Assignment[] = [];
  let totalSubmissions = 0;
  let pendingGrading = 0;
  let gradedSubmissions = 0;

  try {
    // Fetch assignments with submissions data
    const response = await axiosInstance.get(`/api/admin/assignments`);
    if (response && response.status === 200) {
      assignments = response.data?.data || [];
      
      // Calculate statistics
      assignments.forEach(assignment => {
        totalSubmissions += assignment._count.submissions;
        assignment.submissions.forEach(submission => {
          if (submission.grade === null || submission.grade === undefined) {
            pendingGrading++;
          } else {
            gradedSubmissions++;
          }
        });
      });
    }
  } catch (error) {
    console.log("Error fetching classroom data", error);
  }

  const getSubmissionStatus = (submission: any) => {
    if (submission.grade !== null && submission.grade !== undefined) {
      return { status: 'graded', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
    }
    return { status: 'pending', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Clock };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Classroom Management
              </h1>
              <p className="text-gray-600">
                Manage assignments, submissions, and grading
              </p>
            </div>
            <Link
              href="/classroom/create-assignment"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <FileText className="h-5 w-5" />
              Create Assignment
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Assignments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{assignments.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Submissions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalSubmissions}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending Grading */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingGrading}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Graded */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Graded</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{gradedSubmissions}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-gray-500 mb-4">Create your first assignment to get started</p>
                <Link
                  href="/classroom/create-assignment"
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Create Assignment
                </Link>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {assignment.cohortCourse.cohort.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assignment._count.submissions} submissions
                        </span>
                        {assignment.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {assignment.points && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            {assignment.points} points
                          </span>
                        )}
                      </div>

                      {/* Recent Submissions */}
                      {assignment.submissions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Recent Submissions
                          </h4>
                          <div className="space-y-2">
                            {assignment.submissions.slice(0, 3).map((submission) => {
                              const status = getSubmissionStatus(submission);
                              const StatusIcon = status.icon;
                              
                              return (
                                <div
                                  key={submission.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <StatusIcon className={`h-5 w-5 ${status.color}`} />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {submission.student.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {submission.grade && (
                                      <span className="text-sm font-medium text-gray-900">
                                        Grade: {submission.grade}/{assignment.points}
                                      </span>
                                    )}
                                    <Link
                                      href={`/classroom/assignments/${assignment.id}/submissions/${submission.id}`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                      {submission.grade ? 'View' : 'Grade'}
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {assignment.submissions.length > 3 && (
                              <Link
                                href={`/classroom/assignments/${assignment.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                              >
                                View all {assignment.submissions.length} submissions
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      <Link
                        href={`/classroom/assignments/${assignment.id}`}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      >
                        Manage
                      </Link>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}