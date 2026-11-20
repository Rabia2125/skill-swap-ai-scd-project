export type SwapRequestTab = 'received' | 'sent' | 'accepted';

export interface CreateSwapRequestPayload {
  receiverId: string;
  offeredSkill: string;
  requestedSkill: string;
  message: string;
}
