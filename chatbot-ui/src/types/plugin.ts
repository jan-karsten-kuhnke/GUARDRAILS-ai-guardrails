import { KeyValuePair } from './data';

export interface Plugin {
  id: PluginID;
  name: PluginName;
  requiredKeys: KeyValuePair[];
}

export interface PluginKey {
  pluginId: PluginID;
  requiredKeys: KeyValuePair[];
}

export enum PluginID {
  // GOOGLE_SEARCH = 'google-search',
  CHAT_GPT = "gpt-3.5-turbo",
  PRIVATE_DOCS = "private-docs"
}

export enum PluginName {
  // GOOGLE_SEARCH = 'Google Search',
  CHAT_GPT = "Chat-GPT",
  PRIVATE_DOCS = "Private-Docs"
}

export const Plugins: Record<PluginID, Plugin> = {
  [PluginID.CHAT_GPT]: {
    id: PluginID.CHAT_GPT,
    name: PluginName.CHAT_GPT,
    requiredKeys: [
      {
        key: 'CHAT_GPT_API_KEY',
        value: '',
      },
      {
        key: 'CHAT_GPT_CSE_ID',
        value: '',
      },
    ],
  },
  [PluginID.PRIVATE_DOCS]: {
    id: PluginID.PRIVATE_DOCS,
    name: PluginName.PRIVATE_DOCS,
    requiredKeys: [
      {
        key: 'PRIVATE_DOCS_API_KEY',
        value: '',
      },
      {
        key: 'PRIVATE_DOCS_CSE_ID',
        value: '',
      },
    ],
  },
};

export const PluginList = Object.values(Plugins);
