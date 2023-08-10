import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { FC, useContext, useState } from 'react';


import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import HomeContext from '@/pages/home/home.context';

interface Props {
  onClearConversations: () => void;
}

export const ClearConversations: FC<Props> = ({ onClearConversations }) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const { state: { theme } } = useContext(HomeContext);

  const handleClearConversations = () => {
    onClearConversations();
    setIsConfirming(false);
  };

  return isConfirming ? (
    <div className="flex w-full cursor-pointer items-center rounded-lg py-3 px-3 hover:bg-gray-500/10">
      <IconTrash size={18} />

      <div className={`ml-3 flex-1 text-left text-[12.5px] leading-3 ${theme.textColor}`}>
        {('Are you sure?')}
      </div>

      <div className="flex w-[40px]">
        <IconCheck
          className={`ml-auto mr-1 min-w-[20px] ${theme.sidebarActionButtonTheme}`}
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            handleClearConversations();
          }}
        />

        <IconX
          className={`ml-auto min-w-[20px] ${theme.sidebarActionButtonTheme}`}
          size={18}
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirming(false);
          }}
        />
      </div>
    </div>
  ) : (
    <SidebarButton
      text={('Clear conversations')}
      icon={<IconTrash size={18} />}
      onClick={() => setIsConfirming(true)}
    />
  );
};
