export type ActorType = 'actor' | 'model' | 'both';

export interface WorkExperience {
  id: string;
  year: string;
  project: string;
  role: string;
  production: string;
}

export interface Actor {
  id: string;
  name: string;
  type: ActorType;
  gender: 'male' | 'female' | 'non-binary';
  age: number;
  heightCm: number; // e.g. 175
  eyeColor: string;
  hairColor: string;
  hairLength: string;
  ethnicity: string;
  location: string;
  bio: string;
  skills: string[];
  experience: WorkExperience[];
  headshotUrl: string;
  contactEmail: string;
  phone: string;
  instagram?: string;
  website?: string;
  createdAt: string;
  isVerified?: boolean;
  isPremium?: boolean;
  professionalPhotos?: string[];
  languages?: string[]; // African and global languages: Swahili, Yoruba, Zulu, Amharic, etc.
  mediaReels?: {
    videoUrl?: string;
    videoTitle?: string;
    audioUrl?: string;
    audioTitle?: string;
  };
}

export interface CastingRole {
  id: string;
  title: string;
  gender: 'all' | 'male' | 'female' | 'non-binary';
  ageMin: number;
  ageMax: number;
  description: string;
  compensation: string;
  sidesText?: string; // Audition Script / Monologue sides for actor practice
}

export interface CastingCall {
  id: string;
  title: string;
  company: string;
  director: string;
  description: string;
  location: string;
  type: 'film' | 'tv' | 'commercial' | 'theater' | 'modeling';
  roles: CastingRole[];
  dateCreated: string;
  deadline: string;
  budget: string;
  status: 'open' | 'closed';
  isVerified?: boolean;
  imageUrl?: string;
  currency?: string; // local currency: KSh, ₦, R, GH₵, $, etc.
}

export interface Application {
  id: string;
  castingCallId: string;
  roleId: string;
  actorId: string;
  dateApplied: string;
  status: 'pending' | 'shortlisted' | 'invited' | 'accepted' | 'declined';
  message?: string;
  selfTapeUrl?: string; // Recorded mock video audition
  audioAuditionUrl?: string; // Recorded mock audio monologue
}

export type PortalType = 'visitor' | 'actor' | 'producer' | 'admin';

export interface Partner {
  id: string;
  name: string;
  iconName: string; // e.g. 'Film', 'Globe', 'Award', 'TrendingUp', 'Shield'
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  imageUrl: string;
  excerpt: string;
  content: string;
}

export interface PaymentRequest {
  id: string;
  userId?: string;
  userType: 'actor' | 'producer';
  userName: string;
  userPhone: string;
  userEmail: string;
  amount: number;
  currency?: string;
  telebirrAccount?: string;
  transactionRef: string;
  planName: string;
  status: 'pending' | 'approved' | 'rejected';
  dateSubmitted: string;
  dateProcessed?: string;
  notes?: string;
  ownerNotes?: string;
}


