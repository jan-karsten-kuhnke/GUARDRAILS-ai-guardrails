import { FC , useState, useContext} from 'react';
import HomeContext from "@/pages/home/home.context";

import PublicPrivateSwitch from '@/components/PublicPrivateSwitch';

interface Props {}


export const PromptbarSettings: FC<Props> = () => {
  const {
    state: { selectedConversation},

  } = useContext(HomeContext);

  return (
    <>
    {selectedConversation?.messages.length != 0 ? (
      <div className='border-t border-white/20'>
        <PublicPrivateSwitch size={25}/>
      </div>
    ):<></>}
    </>
  )
};
