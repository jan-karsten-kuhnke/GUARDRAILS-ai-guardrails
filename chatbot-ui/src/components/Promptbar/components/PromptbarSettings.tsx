import { FC , useState, useContext} from 'react';
import HomeContext from "@/pages/home/home.context";

import PersonalPrivateSwitch from '@/components/PersonalPrivateSwitch';

interface Props {}


export const PromptbarSettings: FC<Props> = () => {
  const {
    state: { selectedConversation},

  } = useContext(HomeContext);

  console.log(selectedConversation)
  return (
    <>
    {selectedConversation?.messages.length != 0 ? (
      <div className='border-t border-white/20'>
        <PersonalPrivateSwitch size={25}/>
      </div>
    ):<></>}
    </>
  )
};
