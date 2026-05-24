export interface Patient {
  id?: string;
  userId?: string;
  name: string;
  dob?: string;
  maternalAge: number;
  maternalWeight?: number;
  maternalHeight?: number;
  weight?: number; // Added to support previous fields
  height?: number; // Added to support previous fields
  parity?: number;
  smoke?: '0' | '1';
  pregnancyHistory?: string;
  medicalNotes?: string;
  riskLevel?: 'Low' | 'Medium' | 'High' | string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Prediction {
  id?: string;
  patientId: string;
  birthWeight: number;
  confidenceScore: number;
  riskLevel: string;
  recommendations: string[];
  createdAt: any;
}

export interface PredictionRecord {
  id?: string;
  patientId: string;
  userId?: string;
  patientName?: string;
  gestation?: number;
  maternalAge?: number;
  height?: number;
  weight?: number;
  parity?: number;
  smoke?: '0' | '1';
  predictedWeight?: number;
  confidenceScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High' | string;
  aiRecommendations?: string;
  createdAt?: any;
}

export interface Report {
  id?: string;
  title?: string;
  date?: string;
  content?: string;
  predictionId?: string;
  patientId?: string;
  userId?: string;
  generatedAt?: any;
  reportUrl?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalPredictions: number;
  highRiskCases: number;
  averageConfidence: number;
}
