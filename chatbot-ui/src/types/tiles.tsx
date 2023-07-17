import { IconBolt, IconBook, IconNotebook,IconDatabase } from '@tabler/icons-react'; 

export interface Tile {
    displayName: string;
    icon: JSX.Element;
    task: string;
    enabled: boolean;
    additionalInputs?: string[];
  }
  
export const TilesList: Tile[] = [
  {
    displayName: 'Conversational Chatbot',
    icon: <IconBolt size={50} />,
    task: 'conversation',
    enabled: true
  },
  {
    displayName: 'Knowledge Mining on Private Doc',
    icon: <IconBook size={50} />,
    task: 'qa-retreival',
    enabled: true
  },
  {
    displayName: 'Summarize Real Estate Development Brief',
    icon: <IconNotebook size={50} />,
    task: 'summarize-brief',
    additionalInputs: ['fileUpload'],
    enabled: true
  },
  {
    displayName: 'Q&A on SQL Database.',
    icon: <IconDatabase size={50} />,
    task: 'qa-sql',
    enabled: false
  }
];
