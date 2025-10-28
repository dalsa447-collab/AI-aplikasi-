
export type AnalysisStatus = 'processing' | 'completed' | 'failed';

export interface AnalysisResult {
  transkripsi: string;
  ringkasanEksekutif: string;
  poinPenting: string[];
  topik: string[];
  sentimen: 'Positif' | 'Negatif' | 'Netral';
}

export interface MediaFile {
  id: string;
  file: File;
  name: string;
  type: string;
  uploadDate: Date;
  status: AnalysisStatus;
  analysisResult?: AnalysisResult;
  errorMessage?: string;
}
