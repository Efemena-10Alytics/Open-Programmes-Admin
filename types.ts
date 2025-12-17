export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export type User = {
  videosCompleted: number;
  totalVideos: number;
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  emailVerified: string;
  image?: string | null;
  password?: string | null;
  role: UserRole;
  accounts: Account[];
  access_token?: string | null;
  ongoing_courses?: string[];
  completed_courses?: string[];
  course_purchased: PurchaseType[];
  cohorts: UserCohortType[];
  expectedVideoProgress: number;
  inactive?: boolean;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;

};

export type Account = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  user: User;
};

export type BlogType = {
  id: string;
  title: string;
  content: string;
  mins_read: string;
  images: BlogImageType[];
  createdAt: string;
  updatedAt: string;
};

export type BlogImageType = {
  id: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseType = {
  id: string;
  title: string;
  description?: string;
  price?: string;
  discount?: string;
  imageUrl?: string;
  course_duration?: string;
  course_instructor_name?: string;
  course_instructor_image?: string;
  course_instructor_title?: string;
  course_instructor_description?: string;
  course_instructor_ratings?: string;
  course_instructor_courses?: string;
  course_instructor_lessons?: string;
  course_instructor_hrs?: string;
  course_instructor_students_trained?: string;

  brochureUrl?: string;
  course_preview_video?: string;
  course_weeks: CourseWeekType[];
  course_videos: string[]; // Ids of ProjectVideo
  // purchases: string[]; // Ids of Purchase
  timetable: TimeTable[];
  isPublished: boolean;
  cohorts: { id: string }[];
  createdAt: string;
  updatedAt: string;
};

export type TimeTable = {
  id?: string;
  name?: string;
  category?:
    | "LESSON"
    | "QUIZ"
    | "ASSESSMENT"
    | "PROJECT"
    | "LIVE_CLASS"
    | "BREAK";
  date?: Date;
  courseId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CourseWeekType = {
  id: string;
  title: string;
  iconUrl?: string;
  courseId: string;
  course: CourseType;
  attachments: AttachmentType[];
  courseModules: ModuleType[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AttachmentType = {
  id: string;
  name: string;
  url?: string;
  courseWeekId: string;
  courseWeek: CourseWeekType;
  createdAt: string;
  updatedAt: string;
};

export type ModuleType = {
  id: string;
  title: string;
  description?: string;
  iconUrl?: string;
  CourseWeek?: CourseWeekType | null;
  courseWeekId?: string;
  projectVideos?: ProjectVideoType[];
  quizzes?: QuizType[];
  createdAt?: string;
  updatedAt?: string;
};
export type ProjectVideoType = {
  id: string;
  title?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  moduleId?: string;
  courseModule?: ModuleType;
  courseId?: string;
  course?: CourseType;
  createdAt?: string;
  updatedAt?: string;
};
export type QuizType = {
  id: string;
  question?: string;
  answers?: QuizAnswerType[];
  moduleId?: string;
  courseModule?: ModuleType;
  createdAt?: string;
  updatedAt?: string;
};

export type QuizAnswerType = {
  id?: string;
  name?: string;
  quizId?: string;
  quiz?: QuizType;
  isCorrect?: boolean;
};

export type CohortType = {
  id: string;
  name: string;
  startDate?: Date;
  endDate?: Date | null;
  courseId?: string;
  course: CourseType;
  users: UserCohortType[];
  cohortCourses: CohortCourse[];
  createdAt?: string;
  updatedAt?: string;
};

export type UserCohortType = {
  id: string;
  courseId?: string;
  cohortId: string;
  cohort: CohortType;
  userId?: string;
  user: User;
  isPaymentActive: boolean;
  isActive: boolean;
  archivedAt?: Date;
  previousEnrollmentId?: string;
  createdAt?: string;
  updatedAt?: string;
};

interface UserCohort {
  id: string;
  courseId: string;
  cohortId: string;
  cohort: Cohort;
  userId: string;
  user?: User;
  isPaymentActive: boolean;
  isActive: boolean;
  archivedAt?: Date;
  previousEnrollmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CohortCourse = {
  id: string;
  cohortId?: string;
  cohort?: CohortType;
  courseId?: string;
  course?: CourseType;
  title?: string;
  description?: string | null;
  price?: string | null;
  imageUrl?: string | null;
  course_duration?: string | null;
  course_instructor_name?: string | null;
  course_instructor_image?: string | null;
  course_instructor_title?: string | null;
  course_instructor_description?: string | null;
  brochureUrl?: string | null;
  course_preview_video?: string | null;
  cohortTimeTable?: CohortCourseTimetable[];
  cohortWeeks?: CohortCourseWeek[];
  createdAt?: string;
  updatedAt?: string;
};

export type CohortCourseWeek = {
  id: string;
  title?: string;
  iconUrl?: string;
  cohortCourseId?: string;
  isPublished?: boolean;
};

export type CohortCourseTimetable = {
  id?: string;
  name?: string;
  category?:
    | "LESSON"
    | "QUIZ"
    | "ASSESSMENT"
    | "PROJECT"
    | "LIVE_CLASS"
    | "BREAK";
  date?: Date;
  cohortCourseId?: string;
};

interface PurchaseType {
  course: any;
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
}

export interface Cohort {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
}

export type PaymentStatusType =
  | "COMPLETE"
  | "BALANCE_HALF_PAYMENT"
  | "PENDING_SEAT_CONFIRMATION"
  | "EXPIRED";



  export type PaymentPlan =
  | "FULL_PAYMENT"
  | "FIRST_HALF_COMPLETE"
  | "SECOND_HALF_PAYMENT"
  | "THREE_INSTALLMENTS"
  | "FOUR_INSTALLMENTS";

export interface PaymentInstallment {
  id: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  installmentNumber: number;
}

export interface Payment {
  id: string;
  paymentPlan: PaymentPlan;
  status: PaymentStatusType;
  course: Course;
  cohort?: Cohort;
  user: User;
  createdAt: string;
  updatedAt: string;
  paymentInstallments: PaymentInstallment[];
  secondPaymentDueDate?: string;
  desiredStartDate?: string;
}

export interface Facilitator {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  imageUrl?: string;
  bio?: string;
  title?: string;
  courses: Course[];
  createdAt: string;
  updatedAt: string;
}