import { type } from "os";

export interface Message {
  id?: string ;
  role: Role;
  content: string;
  userActionRequired: boolean;
  msg_info: any;
  user_feedback?: UserFeedback;
}

export interface UserFeedback{
  type: string;
  message: string;
}

export type Role = 'assistant' | 'user' | 'guardrails';
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  prompt: string;
  temperature: number;
  folderId: string | null;
  archived: boolean;
  task: string;
  task_params: any;
  acl: any;
}
