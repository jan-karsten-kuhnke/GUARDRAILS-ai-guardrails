import { FC, useContext, useState, useEffect } from "react";
import HomeContext from "@/pages/home/home.context";

// import PublicPrivateSwitch from "@/components/PublicPrivateSwitch";
import { IconBoxMultiple, IconFileDescription, IconListDetails } from "@tabler/icons-react";

interface Props { }

export const PromptbarFooter: FC<Props> = () => {
  const {
    state: { selectedConversation, selectedTile, tiles, theme },
  } = useContext(HomeContext);

  const [taskTitle, setTaskTitle] = useState<string>('');

  useEffect(() => {
    // Checking for new chat
    if(selectedConversation?.messages.length === 0){
      setTaskTitle(selectedTile.title);
    }
    // for an existing chat
    else{
      const selectedTask = tiles.find(tile => tile.code === selectedConversation?.task);
      if(selectedTask){
        setTaskTitle(selectedTask.title);
      }
    }
  },[selectedConversation,selectedTile]);

  return (
    <>
      {selectedConversation?.messages.length != 0 && (
        <>
              <div className="pt-1  border-t border-white/20"></div>
              {selectedConversation && selectedConversation.messages.length > 0 && (
                <>
                  <div className="text-[14px] font-semibold">Current Conversation</div>
                  <div className={`text-[12px] flex w-full item-center gap-2 py-1 ${theme.botMsgTextColorTheme} ml-2`}>
                    <IconListDetails size={20} />
                    <span className="font-semibold">Applet: </span>
                    <div className="w-full">
                      {taskTitle}
                    </div>
                  </div>
                  {selectedConversation?.task_params?.collectionName &&
                    <div className={`text-[12px] flex w-full item-center gap-2 py-1 ${theme.botMsgTextColorTheme} ml-2`}>
                      <IconBoxMultiple size={20} />
                      <span className="font-semibold">Collection: </span>
                      <div className="w-full">
                        {selectedConversation?.task_params?.collectionName}
                      </div>
                    </div>}
                  {selectedConversation?.task_params?.document?.title &&
                    <div className={`text-[12px] flex w-full item-center gap-2 py-1 ${theme.botMsgTextColorTheme} ml-2`}>
                      <IconFileDescription size={20} />
                      <span className="font-semibold">Document:</span>
                      <div className=" w-full">
                        {selectedConversation?.task_params?.document?.title}
                      </div>
                    </div>}
                </>
              )}
          {/* <div className={`pt-6 ${theme.dividerTopTheme}`}>
            <PublicPrivateSwitch size={25} />
          </div> */}
        </>
      )}
    </>
  );
};
