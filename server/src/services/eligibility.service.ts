export interface StudentEligibilityData {
  branch: string | null;
  graduationYear: number | null;
  cgpa: number | null;
  class10Percent: number | null;
  class12Percent: number | null;
  activeBacklogs: number;
  backlogHistory: number;
}

export interface DriveEligibilityData {
  eligibleBranches: { branch: string }[];
  eligibilityCriteria: {
    minCgpa: number | null;
    minClass10: number | null;
    minClass12: number | null;
    maxActiveBacklogs: number;
    allowBacklogHistory: boolean;
    graduationYears: string | null;
  } | null;
}

export interface EligibilityResult {
  eligible: boolean;
  satisfied: string[];
  unmet: string[];
  reasons: string[];
}

export function checkEligibility(
  student: StudentEligibilityData,
  drive: DriveEligibilityData,
): EligibilityResult {
  const satisfied: string[] = [];
  const unmet: string[] = [];

  const criteria = drive.eligibilityCriteria;

  // Branch check
  if (drive.eligibleBranches.length > 0) {
    const branches = drive.eligibleBranches.map((b) => b.branch.toUpperCase());
    if (student.branch && branches.includes(student.branch.toUpperCase())) {
      satisfied.push(`Branch: ${student.branch}`);
    } else {
      unmet.push(
        `Branch not eligible. Your branch: ${student.branch || 'Not set'}. Eligible: ${branches.join(', ')}`,
      );
    }
  } else {
    satisfied.push('All branches eligible');
  }

  if (!criteria) {
    return {
      eligible: unmet.length === 0,
      satisfied,
      unmet,
      reasons: unmet,
    };
  }

  // Graduation year check
  if (criteria.graduationYears) {
    const allowedYears = criteria.graduationYears.split(',').map((y) => parseInt(y.trim(), 10));
    if (student.graduationYear && allowedYears.includes(student.graduationYear)) {
      satisfied.push(`Graduation year: ${student.graduationYear}`);
    } else {
      unmet.push(
        `Graduation year not eligible. Your year: ${student.graduationYear || 'Not set'}. Eligible: ${criteria.graduationYears}`,
      );
    }
  }

  // CGPA check
  if (criteria.minCgpa !== null && criteria.minCgpa !== undefined) {
    if (student.cgpa !== null && student.cgpa >= criteria.minCgpa) {
      satisfied.push(`CGPA: ${student.cgpa} >= ${criteria.minCgpa}`);
    } else {
      unmet.push(
        `CGPA too low. Required: ${criteria.minCgpa}, Yours: ${student.cgpa ?? 'Not set'}`,
      );
    }
  }

  // Class 10 check
  if (criteria.minClass10 !== null && criteria.minClass10 !== undefined) {
    if (student.class10Percent !== null && student.class10Percent >= criteria.minClass10) {
      satisfied.push(`Class 10: ${student.class10Percent}% >= ${criteria.minClass10}%`);
    } else {
      unmet.push(
        `Class 10% too low. Required: ${criteria.minClass10}%, Yours: ${student.class10Percent ?? 'Not set'}`,
      );
    }
  }

  // Class 12 check
  if (criteria.minClass12 !== null && criteria.minClass12 !== undefined) {
    if (student.class12Percent !== null && student.class12Percent >= criteria.minClass12) {
      satisfied.push(`Class 12: ${student.class12Percent}% >= ${criteria.minClass12}%`);
    } else {
      unmet.push(
        `Class 12% too low. Required: ${criteria.minClass12}%, Yours: ${student.class12Percent ?? 'Not set'}`,
      );
    }
  }

  // Backlog check
  if (student.activeBacklogs > criteria.maxActiveBacklogs) {
    unmet.push(
      `Active backlogs: ${student.activeBacklogs} (max allowed: ${criteria.maxActiveBacklogs})`,
    );
  } else {
    satisfied.push(`Active backlogs: ${student.activeBacklogs} <= ${criteria.maxActiveBacklogs}`);
  }

  // Backlog history check
  if (!criteria.allowBacklogHistory && student.backlogHistory > 0) {
    unmet.push(`Backlog history not allowed (you have ${student.backlogHistory} past backlogs)`);
  } else if (criteria.allowBacklogHistory) {
    satisfied.push('Backlog history allowed');
  }

  return {
    eligible: unmet.length === 0,
    satisfied,
    unmet,
    reasons: unmet,
  };
}

export function calculateProfileCompletion(profile: {
  phone: string | null;
  photoUrl: string | null;
  rollNumber: string | null;
  graduationYear: number | null;
  branch: string | null;
  degree: string | null;
  cgpa: number | null;
  class10Percent: number | null;
  class12Percent: number | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  bio: string | null;
}): number {
  const fields = [
    profile.phone,
    profile.photoUrl,
    profile.rollNumber,
    profile.graduationYear,
    profile.branch,
    profile.degree,
    profile.cgpa,
    profile.class10Percent,
    profile.class12Percent,
    profile.linkedinUrl,
    profile.githubUrl,
    profile.portfolioUrl,
    profile.bio,
  ];

  const filled = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
  return Math.round((filled / fields.length) * 100);
}
