
export interface Message {
  role: Role;
  content: string;
  userActionRequired: boolean;
  msg_info: any
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
}
