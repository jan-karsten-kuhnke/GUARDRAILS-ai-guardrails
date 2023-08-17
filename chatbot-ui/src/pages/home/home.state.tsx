import { Conversation, Message } from '@/types/chat';
import { FolderInterface } from '@/types/folder';
import { Prompt } from '@/types/prompt';
import { Tile } from '@/types/tiles';
import { theme } from '@/styles';
import { collection } from '@/types/collection';

export interface HomeInitialState {
  loading: boolean;
  theme: any;
  messageIsStreaming: boolean;
  folders: FolderInterface[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  prompts: Prompt[];
  showChatbar: boolean;
  showPromptbar: boolean;
  isDocumentDialogOpen: boolean;
  isSettingDialogOpen: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  searchTerm: string;
  refreshConversations: boolean;
  isArchiveView: boolean;
  isPrivate: boolean;
  selectedTile: Tile | any;
  tiles: Tile[];
  collections: collection[];
  selectedCollection: string;
  showOnboardingGuide: boolean;
}

export const initialState: HomeInitialState = {
  loading: false,
  theme: theme,
  messageIsStreaming: false,
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  showPromptbar: true,
  isDocumentDialogOpen: false,
  isSettingDialogOpen: false,
  showChatbar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
  refreshConversations: false,
  isArchiveView: false,
  isPrivate: false,
  tiles: [],
  collections: [],
  selectedCollection: "",
  selectedTile: {},
  showOnboardingGuide: false,
};
