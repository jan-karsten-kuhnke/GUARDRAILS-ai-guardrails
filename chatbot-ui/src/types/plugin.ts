import { KeyValuePair } from './data';

export interface Plugin {
  id: PluginID;
  name: PluginName;
  task:PluginTask;
  requiredKeys: KeyValuePair[];
}

export interface PluginKey {
  pluginId: PluginID;
  requiredKeys: KeyValuePair[];
}

export enum PluginID {
  // GOOGLE_SEARCH = 'google-search',
  CONVERSATION = "gpt-3.5-turbo",
  QA_PRIVATE_DOCS = "private-docs",
  PRIVATE_DOCS_PRIVATE_LLM = "private-docs-private-llm",

}

export enum PluginName {
  // GOOGLE_SEARCH = 'Google Search',
  CONVERSATION = "Conversation with GPT-3.5 Turbo",
  QA_PRIVATE_DOCS = "QA on Private-Docs with OpenAI",
  PRIVATE_DOCS_PRIVATE_LLM = "QA on Private-Docs with private LLM",

}

export enum PluginTask {
  // GOOGLE_SEARCH = 'Google Search',
  CONVERSATION= "conversation",
  QA_PRIVATE_DOCS = "qa-on-private-docs",
  PRIVATE_DOCS_PRIVATE_LLM = "QA on Private-Docs with private LLM",

}

export const Plugins: Record<PluginID, Plugin> = {
  [PluginID.CONVERSATION]: {
    id: PluginID.CONVERSATION,
    name: PluginName.CONVERSATION,
    task:PluginTask.CONVERSATION,
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
  [PluginID.QA_PRIVATE_DOCS]: {
    id: PluginID.QA_PRIVATE_DOCS,
    name: PluginName.QA_PRIVATE_DOCS,
    task:PluginTask.QA_PRIVATE_DOCS,
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
   [PluginID.PRIVATE_DOCS_PRIVATE_LLM]: {
    id: PluginID.PRIVATE_DOCS_PRIVATE_LLM,
    name: PluginName.PRIVATE_DOCS_PRIVATE_LLM,
    task:PluginTask.PRIVATE_DOCS_PRIVATE_LLM,
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
