export enum Personality {
  Nihara = 'Nihara',
  Niru = 'Niru',
  Luna = 'Luna',
}

export enum MessageSender {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  image?: string; // base64 image
  isTyping?: boolean;
  sources?: { title: string; uri: string; }[];
}

export enum AppMode {
    Chat = 'Chat',
    ImageGen = 'Image Generation',
    DeepResearch = 'Deep Research',
    CodeWriter = 'Write Code',
    StudyBuddy = 'Study & Learn',
    AstroGuide = 'Astro Guide',
    AIDiary = 'AI Diary',
}

export interface VoiceOption {
    id: string;
    name: string;
    gender: 'female' | 'male';
}

export interface ChatHistory {
    id: string;
    messages: ChatMessage[];
    timestamp: number;
    summary: string;
    personality: Personality;
    mode: AppMode;
}

export interface DiaryEntry {
    id:string;
    timestamp: number;
    content: string;
}

export interface GeneratedImage {
  id: string;
  src: string; // base64 string
  prompt: string;
  aspectRatio: string;
}

export interface Reminder {
  id: string;
  text: string;
  dueTime: number; // unix timestamp
}