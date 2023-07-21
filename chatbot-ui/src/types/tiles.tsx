import * as Icons from '@tabler/icons-react';
import React from 'react';

export interface Tile {
  title: string;
  has_access: boolean;
  icon: string;
  code: string;
  is_active: boolean;
  request_submitted: boolean;
  params?: {
    inputs: [{
      key: string, type: string
    }]
  };
}


