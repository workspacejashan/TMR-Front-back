import { Job } from '../types';
import { geminiService } from './geminiService'; // Using the AI service to generate jobs

export interface JobSearchCriteria {
    roles: string[];
    location: string;
}

export const jobSearchService = {
  findJobs: async (criteria: JobSearchCriteria): Promise<Job[]> => {
    console.log("Finding jobs with AI using criteria:", criteria);
    
    // Using the AI to generate realistic job listings based on user profile.
    const jobs = await geminiService.findJobsWithAi(criteria);
    
    return jobs;
  },
};
