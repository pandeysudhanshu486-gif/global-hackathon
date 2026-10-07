export interface OpportunitySummary {
  id: string;
  title: string;
  companyName: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  type: 'apprenticeship' | 'internship' | 'entry_level' | 'junior_developer';
  location: string;
  workPreference: 'remote' | 'onsite' | 'hybrid';
  targetRole: string;
  requiredCapabilities: string[];
  recommendedCapabilities?: string[];
  description: string;
  mentorshipProvided: boolean;
  stipendOrSalary?: string;
  duration?: string;
  isOpen: boolean;
  applicantsCount: number;
  createdAt: string;
}

export interface StudentOpportunityMatch extends OpportunitySummary {
  candidateMatch: {
    demonstratedMatches: string[];
    missingCapabilities: string[];
    matchPercentage: number;
    hasApplied: boolean;
    applicationStatus?: 'submitted' | 'under_review' | 'accepted' | 'declined';
    qualifiesForDirectApply: boolean;
  };
}
