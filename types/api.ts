export interface Country {
  country: string;
  cities: string[];
}

export interface University {
  name: string;
  country: string;
}

export interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  username?: string;
  error?: string;
}

export interface PdfUploadResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}
