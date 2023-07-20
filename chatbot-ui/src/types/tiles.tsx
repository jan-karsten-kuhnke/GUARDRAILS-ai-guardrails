import * as Icons from '@tabler/icons-react'; 
import React from 'react';

export interface Tile {
    title: string;
    icon: string;
    code: string;
    is_active: boolean;
    params?: {inputs:[{
      key : string,type:string
    }]};
  }

  // type ObjectKey = keyof typeof Icons;

  
  // const getIcon = (val:string) => {
  //   const myVar = val as ObjectKey;
  //   console.log("val", val , typeof Icons[myVar] );
  //   const Icon   = Icons[myVar];
  //   return React.createElement(Icon,{size:50})
  // }

// export const TilesList: Tile[] = [
//   {
//     displayName: 'Conversational Chatbot',
//     icon: getIcon("IconBolt"),
//     task: 'conversation',
//     enabled: true
//   },
//   {
//     displayName: 'Knowledge Mining on Private Doc',
//     icon: getIcon("IconBook"),
//     task: 'qa-retreival',
//     enabled: true
//   },
//   {
//     displayName: 'Summarize Real Estate Development Brief',
//     icon: getIcon("IconNotebook"),
//     task: 'summarize-brief',
//     additionalInputs: ['fileUpload'],
//     enabled: true
//   },
//   {
//     displayName: 'Q&A on SQL Database.',
//     icon: getIcon("IconDatabase"),
//     task: 'qa-sql',
//     enabled: false
//   }
// ];
