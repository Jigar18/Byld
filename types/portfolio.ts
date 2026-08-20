export type PortfolioDetails = {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  jobTitle: string;
  college: string;
  imageUrl: string;
  about?: string;
};

export type PortfolioEducation = {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  isCurrently: boolean;
  description?: string;
};

export type PortfolioExperience = {
  id: string;
  company: string;
  position: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrentRole: boolean;
  contributions: string[];
};

export type PortfolioCertificate = {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
};

export type PortfolioProjectData = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  videoUrl: string | null;
  videoPublicId: string | null;
  videoDuration: number | null;
  videoBytes: number | null;
  videoFormat: string | null;
  images: Array<{
    id: string;
    imageUrl: string;
    imagePublicId: string;
    position: number;
  }>;
};

export type PortfolioInitialData = {
  username: string;
  isOwner: boolean;
  details: PortfolioDetails;
  skills: string[];
  iconMap: Record<string, string | null>;
  projects: PortfolioProjectData[];
  experiences: PortfolioExperience[];
  socialLinks: Record<string, string | null>;
  certifications: PortfolioCertificate[];
  education: PortfolioEducation[];
};
