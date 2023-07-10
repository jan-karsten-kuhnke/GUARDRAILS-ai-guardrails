import { IconBolt, IconBook, IconNotebook } from '@tabler/icons-react'; 

export interface Tile {
    displayName: string;
    icon: JSX.Element;
    task: string;
    additionalInputs?: string[];
  }
  
export const TilesList: Tile[] = [
  {
    displayName: 'Conversational Chatbot',
    icon: <IconBolt size={80} />,
    task: 'conversation',
  },
  {
    displayName: 'Knowledge Mining on Private Doc',
    icon: <IconBook size={80} />,
    task: 'qa-retreival'
  },
  {
    displayName: 'Summarize Brief',
    icon: <IconNotebook size={80} />,
    task: 'summarize-brief',
    additionalInputs: ['fileUpload']
  }
];
