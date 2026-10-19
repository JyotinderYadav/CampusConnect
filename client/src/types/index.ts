export type Role = "STUDENT" | "PLACEMENT_OFFICER" | "RECRUITER";

export type DriveStatus = "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "ASSESSMENT"
  | "TECHNICAL_INTERVIEW"
  | "HR_INTERVIEW"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export type JobType = "INTERNSHIP" | "FULL_TIME" | "INTERNSHIP_TO_FULL_TIME";
export type WorkMode = "ON_SITE" | "REMOTE" | "HYBRID";

export interface User {
  id: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  collegeId: string;
  college?: {
    id: string;
    name: string;
    code: string;
  };
  studentProfile?: StudentProfile;
  recruiterProfile?: RecruiterProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
  rollNumber?: string;
  graduationYear?: number;
  branch?: string;
  degree?: string;
  cgpa?: number;
  class10Percent?: number;
  class12Percent?: number;
  activeBacklogs: number;
  backlogHistory: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  profileComplete: number;
  skills?: StudentSkill[];
  projects?: Project[];
  experiences?: Experience[];
  certifications?: Certification[];
  resumes?: Resume[];
}

export interface StudentSkill {
  id: string;
  skillId: string;
  proficiency: string;
  skill: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  technologies?: string;
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface Resume {
  id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  isDefault: boolean;
  version: number;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  description?: string;
}

export interface RecruiterProfile {
  id: string;
  name: string;
  designation?: string;
  phone?: string;
  companyId: string;
  company?: Company;
}

export interface PlacementDrive {
  id: string;
  collegeId: string;
  companyId: string;
  company: Company;
  title: string;
  description?: string;
  jobType: JobType;
  ctc?: number;
  stipend?: number;
  packageBreakdown?: string;
  location?: string;
  workMode: WorkMode;
  vacancies?: number;
  applicationOpenDate: string;
  applicationCloseDate: string;
  status: DriveStatus;
  eligibilityCriteria?: EligibilityCriteria;
  eligibleBranches?: { id: string; branch: string }[];
  skillRequirements?: { id: string; skill: { name: string }; isRequired: boolean }[];
  stages?: RecruitmentStage[];
  _count?: {
    applications: number;
  };
  isEligible?: boolean;
  eligibilityDetails?: EligibilityResult;
  hasApplied?: boolean;
  isBookmarked?: boolean;
}

export interface EligibilityCriteria {
  id: string;
  minCgpa?: number;
  minClass10?: number;
  minClass12?: number;
  maxActiveBacklogs: number;
  allowBacklogHistory: boolean;
  graduationYears?: string;
}

export interface RecruitmentStage {
  id: string;
  name: string;
  order: number;
  description?: string;
}

export interface Application {
  id: string;
  studentId: string;
  student: StudentProfile & { user?: { email: string } };
  driveId: string;
  drive: PlacementDrive;
  resumeId?: string;
  resume?: Resume;
  status: ApplicationStatus;
  appliedAt: string;
  statusHistory?: ApplicationStatusHistory[];
  interviews?: Interview[];
}

export interface ApplicationStatusHistory {
  id: string;
  status: ApplicationStatus;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  stageId?: string;
  stage?: RecruitmentStage;
  scheduledAt: string;
  mode: string;
  location?: string;
  meetingLink?: string;
  feedback?: string;
  result?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  targetRoles?: string;
  createdAt: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  satisfied: string[];
  unmet: string[];
}
