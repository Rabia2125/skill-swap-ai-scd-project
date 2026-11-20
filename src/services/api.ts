import { authService } from '../features/authentication/services/authService';
import { dashboardService } from '../features/dashboard/services/dashboardService';
import { profileService } from '../features/user-profile/services/profileService';
import { browseSkillsService } from '../features/browse-skills/services/browseSkillsService';
import { swapService } from '../features/swap-requests/services/swapService';
import { messagingService } from '../features/messaging/services/messagingService';
import { aiAssistantService } from '../features/ai-assistant/services/aiAssistantService';
import { exchangeService } from '../features/exchange-history/services/exchangeService';
import { settingsService } from '../features/settings/services/settingsService';
import { notificationService } from '../features/notifications/services/notificationService';

export {
  TOKEN_KEY,
  USER_KEY,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth,
  request
} from './apiClient';

// Shared API facade composed from feature services
export const api = {
  ...authService,
  ...dashboardService,
  ...profileService,
  ...browseSkillsService,
  ...swapService,
  ...messagingService,
  ...aiAssistantService,
  ...exchangeService,
  ...settingsService,
  ...notificationService
};
