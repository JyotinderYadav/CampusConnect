export type Role = 'STUDENT' | 'PLACEMENT_OFFICER' | 'RECRUITER';

export type DriveStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'ASSESSMENT'
  | 'TECHNICAL_INTERVIEW'
  | 'HR_INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type JobType = 'INTERNSHIP' | 'FULL_TIME' | 'INTERNSHIP_TO_FULL_TIME';

export type WorkMode = 'ON_SITE' | 'REMOTE' | 'HYBRID';

export interface UserSummary {
  id: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  collegeId: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  satisfied: string[];
  unmet: string[];
}