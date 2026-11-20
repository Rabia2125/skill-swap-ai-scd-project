import { vi } from 'vitest';
import { User, SwapRequest, Conversation, Message, NotificationItem, ExchangeRecord } from '../../src/types';

export const mockUserAlex: User = {
  id: 'user_alex',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  location: 'San Francisco, CA',
  role: 'member',
  createdAt: '2025-01-10T10:00:00Z',
  profile: {
    id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    avatar: 'https://example.com/alex.jpg',
    location: 'San Francisco, CA',
    bio: 'Full-stack TypeScript engineer passionate about React and clean design.',
    title: 'Senior Full-Stack Developer',
    skillsToTeach: [
      {
        id: 'sk_1',
        name: 'React.js',
        category: 'Programming',
        level: 'Expert',
        experienceYears: 5,
        description: 'Hooks, state management, and component architecture.'
      },
      {
        id: 'sk_2',
        name: 'TypeScript',
        category: 'Programming',
        level: 'Advanced',
        experienceYears: 4
      }
    ],
    skillsToLearn: ['UI/UX Design', 'Figma'],
    experience: '6 years building SaaS web apps',
    education: 'B.S. Computer Science',
    interests: ['Open Source', 'Design Systems'],
    availability: 'Weekday evenings (6 PM - 8 PM PST)',
    learningGoals: 'Build cohesive design systems in Figma',
    joinedDate: 'Jan 2025',
    rating: 4.9,
    exchangesCompleted: 3
  }
};

export const mockUserMaya: User = {
  id: 'user_maya',
  name: 'Maya Lin',
  email: 'maya.lin@example.com',
  location: 'Brooklyn, NY',
  role: 'member',
  createdAt: '2025-01-12T10:00:00Z',
  profile: {
    id: 'user_maya',
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    avatar: 'https://example.com/maya.jpg',
    location: 'Brooklyn, NY',
    bio: 'Lead product designer crafting accessible interfaces.',
    title: 'Lead UI/UX Designer',
    skillsToTeach: [
      {
        id: 'sk_3',
        name: 'Figma Design Systems',
        category: 'UI/UX Designing',
        level: 'Expert',
        experienceYears: 6
      }
    ],
    skillsToLearn: ['React.js', 'Tailwind CSS'],
    experience: '7 years in product design',
    education: 'BFA Communication Design',
    interests: ['Typography', 'Prototyping'],
    availability: 'Weekends & Tuesday evenings',
    learningGoals: 'Ship interactive React prototypes',
    joinedDate: 'Jan 2025',
    rating: 5.0,
    exchangesCompleted: 5
  }
};

export const mockSwapRequests: SwapRequest[] = [
  {
    id: 'req_1',
    senderId: 'user_maya',
    senderName: 'Maya Lin',
    senderAvatar: 'https://example.com/maya.jpg',
    senderLocation: 'Brooklyn, NY',
    receiverId: 'user_alex',
    receiverName: 'Alex Rivera',
    receiverAvatar: 'https://example.com/alex.jpg',
    receiverLocation: 'San Francisco, CA',
    offeredSkill: 'Figma Design Systems',
    requestedSkill: 'React.js',
    message: 'Would love to swap Figma coaching for React hooks help!',
    status: 'Pending',
    createdAt: '2025-02-01T12:00:00Z',
    updatedAt: '2025-02-01T12:00:00Z'
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    swapRequestId: 'req_accepted_1',
    participants: ['user_alex', 'user_maya'],
    partner: {
      id: 'user_maya',
      name: 'Maya Lin',
      avatar: 'https://example.com/maya.jpg',
      title: 'Lead UI/UX Designer',
      location: 'Brooklyn, NY',
      skillsBeingExchanged: {
        partnerTeaches: 'Figma Design Systems',
        userTeaches: 'React.js'
      }
    },
    lastMessage: {
      content: 'Looking forward to our session!',
      senderId: 'user_maya',
      createdAt: '2025-02-02T14:00:00Z'
    },
    unreadCount: 1,
    updatedAt: '2025-02-02T14:00:00Z'
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg_sys',
    conversationId: 'conv_1',
    senderId: 'system',
    senderName: 'System',
    senderAvatar: '',
    content: 'Skill swap accepted! Start coordinating your sessions.',
    createdAt: '2025-02-02T13:00:00Z',
    read: true
  },
  {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'user_maya',
    senderName: 'Maya Lin',
    senderAvatar: 'https://example.com/maya.jpg',
    content: 'Hi Alex, excited to start!',
    createdAt: '2025-02-02T14:00:00Z',
    read: true
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'user_alex',
    title: 'New Swap Request',
    message: 'Maya Lin proposed a Figma for React swap.',
    type: 'swap_request',
    link: '/requests',
    read: false,
    createdAt: '2025-02-01T12:00:00Z'
  },
  {
    id: 'notif_2',
    userId: 'user_alex',
    title: 'Welcome to SkillSwap AI',
    message: 'Complete your profile to attract more partners.',
    type: 'system',
    link: '/profile',
    read: true,
    createdAt: '2025-01-10T10:00:00Z'
  }
];

export const mockExchanges: ExchangeRecord[] = [
  {
    id: 'ex_1',
    swapRequestId: 'req_accepted_1',
    partnerId: 'user_maya',
    partnerName: 'Maya Lin',
    partnerAvatar: 'https://example.com/maya.jpg',
    skillReceived: 'Figma Design Systems',
    skillTaught: 'React.js',
    startDate: '2025-02-01',
    status: 'Active'
  },
  {
    id: 'ex_2',
    swapRequestId: 'req_done_2',
    partnerId: 'user_carlos',
    partnerName: 'Carlos Mendez',
    partnerAvatar: 'https://example.com/carlos.jpg',
    skillReceived: 'Spanish Conversation',
    skillTaught: 'TypeScript',
    startDate: '2025-01-05',
    completionDate: '2025-01-25',
    status: 'Completed',
    rating: 5,
    review: 'Clear explanations and very patient!'
  }
];

export function mockFetchResponse(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

export function createMockFetch(handler: (url: string, init?: RequestInit) => Promise<Response> | Response) {
  const spy = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    return Promise.resolve(handler(url, init));
  });
  vi.stubGlobal('fetch', spy);
  return spy;
}
