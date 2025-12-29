import { apiClient } from '../client';
import type { ApiResponse } from '@/lib/types/api';
import type {
  BloodType,
  Religion,
  City,
  EducationLevel,
  RelationshipType,
} from '@/lib/types/hr';

// Master Data API
export const masterDataApi = {
  getBloodTypes: async (): Promise<ApiResponse<BloodType[]>> => {
    return apiClient.get('/master-data/blood-types');
  },

  getReligions: async (): Promise<ApiResponse<Religion[]>> => {
    return apiClient.get('/master-data/religions');
  },

  getCities: async (): Promise<ApiResponse<City[]>> => {
    return apiClient.get('/master-data/cities');
  },

  getEducationLevels: async (): Promise<ApiResponse<EducationLevel[]>> => {
    return apiClient.get('/master-data/education-levels');
  },

  getRelationshipTypes: async (): Promise<ApiResponse<RelationshipType[]>> => {
    return apiClient.get('/master-data/relationship-types');
  },
};