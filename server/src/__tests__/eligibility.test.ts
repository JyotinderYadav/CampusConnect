import { describe, it, expect } from 'vitest';
import { checkEligibility } from '../services/eligibility.service';

const eligibleStudent = {
  branch: 'CSE',
  graduationYear: 2025,
  cgpa: 8.5,
  class10Percent: 90,
  class12Percent: 85,
  activeBacklogs: 0,
  backlogHistory: 0,
};

const baseDrive = {
  eligibleBranches: [{ branch: 'CSE' }, { branch: 'ECE' }],
  eligibilityCriteria: {
    minCgpa: 7.0,
    minClass10: 60,
    minClass12: 60,
    maxActiveBacklogs: 0,
    allowBacklogHistory: false,
    graduationYears: '2025,2026',
  },
};

describe('Eligibility Service', () => {
  it('should return eligible: true for a fully eligible student', () => {
    const result = checkEligibility(eligibleStudent, baseDrive);
    expect(result.eligible).toBe(true);
    expect(result.unmet).toHaveLength(0);
  });

  it('should return ineligible for student with low CGPA', () => {
    const student = { ...eligibleStudent, cgpa: 6.0 };
    const result = checkEligibility(student, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.unmet.some((r) => r.includes('CGPA'))).toBe(true);
  });

  it('should return ineligible for student with active backlogs', () => {
    const student = { ...eligibleStudent, activeBacklogs: 2 };
    const result = checkEligibility(student, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.unmet.some((r) => r.includes('backlog'))).toBe(true);
  });

  it('should return ineligible for student from wrong branch', () => {
    const student = { ...eligibleStudent, branch: 'MECH' };
    const result = checkEligibility(student, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.unmet.some((r) => r.includes('Branch'))).toBe(true);
  });

  it('should return ineligible for wrong graduation year', () => {
    const student = { ...eligibleStudent, graduationYear: 2023 };
    const result = checkEligibility(student, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.unmet.some((r) => r.includes('Graduation year'))).toBe(true);
  });

  it('should return ineligible when backlog history exists and not allowed', () => {
    const student = { ...eligibleStudent, backlogHistory: 1 };
    const result = checkEligibility(student, baseDrive);
    expect(result.eligible).toBe(false);
    expect(result.unmet.some((r) => r.includes('Backlog history'))).toBe(true);
  });

  it('should allow all branches when eligibleBranches is empty', () => {
    const driveNoRestrictions = { ...baseDrive, eligibleBranches: [] };
    const student = { ...eligibleStudent, branch: 'MECH' };
    const result = checkEligibility(student, driveNoRestrictions);
    expect(result.satisfied.some((s) => s.includes('All branches'))).toBe(true);
  });

  it('should be eligible when no criteria set', () => {
    const driveNoCriteria = {
      eligibleBranches: [{ branch: 'CSE' }],
      eligibilityCriteria: null,
    };
    const result = checkEligibility(eligibleStudent, driveNoCriteria);
    expect(result.eligible).toBe(true);
  });
});
