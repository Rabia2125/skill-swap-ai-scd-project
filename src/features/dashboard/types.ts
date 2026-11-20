import { SwapRequest, User } from '../../types';

export interface DashboardStats {
  skillsOffered: number;
  skillsWanted: number;
  sentRequestsCount: number;
  receivedRequestsCount: number;
  acceptedExchangesCount: number;
  unreadMessagesCount: number;
  exchangesCompletedCount: number;
}

export interface SmartMatch {
  user: User;
  matchScore: number;
  matchingOffers: string[];
  matchingWants: string[];
  reason: string;
}

export interface DashboardStatsResponse {
  stats: DashboardStats;
  recentRequests: SwapRequest[];
  smartMatches: SmartMatch[];
}
