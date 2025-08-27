import { Job, JobSearchCriteria } from '../types';
import { aiService } from './geminiService'; // Using the AI service to generate jobs

export const jobSearchService = {
  findJobs: async (criteria: JobSearchCriteria): Promise<Job[]> => {
    console.log("Finding jobs with AI using criteria:", criteria);
    
    // Using the AI to generate realistic job listings based on user profile.
    const jobs = await aiService.findJobsWithAi(criteria);
    
    return jobs;
  },
};
