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

  
