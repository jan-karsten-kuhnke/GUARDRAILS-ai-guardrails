import { IconFolderPlus, IconMistOff, IconPlus } from "@tabler/icons-react";
import { ReactNode, useContext } from "react";
import { useEffect,useState } from "react";
import HomeContext from "@/pages/home/home.context";

import {
  CloseSidebarButton,
  OpenSidebarButton,
} from "./components/OpenCloseButton";

import Search from "../Search";
import { IconFileDescription,IconBoxMultiple,IconListDetails   } from '@tabler/icons-react';

interface Props<T> {
  isOpen: boolean;
  addItemButtonTitle: string;
  side: "left" | "right";
  items: T[];
  itemComponent: ReactNode;
  folderComponent: ReactNode;
  footerComponent?: ReactNode;
  searchTerm: string;
  folderDisplayName: string;
  isArchiveView: boolean;
  itemDisplayName: string;
  handleSearchTerm: (searchTerm: string) => void;
  toggleOpen: () => void;
  handleCreateItem: () => void;
  handleCreateFolder: () => void;
  handleDrop: (e: any) => void;
}

const Sidebar = <T,>({
  isOpen,
  addItemButtonTitle,
  side,
  items,
  itemComponent,
  folderComponent,
  footerComponent,
  searchTerm,
  folderDisplayName,
  isArchiveView: isArhiveView,
  itemDisplayName,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  handleCreateFolder,
  handleDrop,
}: Props<T>) => {
  const {
    state: { theme, selectedConversation, selectedTile, tiles },   
  } = useContext(HomeContext);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [qaDocumentTitle, setQaDocumentTitle] = useState<string | null>(null);

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = theme.itemDropColor;
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = "none";
  };

  useEffect(() => {
    // Checking for new chat
    if(selectedConversation?.messages.length === 0){
      setTaskTitle(selectedTile.title);
      setCollectionName('');
      setQaDocumentTitle('');
    }
    // for an existing chat
    else{
      const selectedTask = tiles.find(tile => tile.code === selectedConversation?.task);
      if(selectedTask){
        setTaskTitle(selectedTask.title);
      }
    }
    if (selectedConversation && selectedConversation.task_params) {
      setCollectionName(selectedConversation?.task_params.collectionName);
      setQaDocumentTitle(selectedConversation.task_params.documentName);
    }
  },[selectedConversation,selectedTile]);

  return isOpen ? (
    <div>
      <div
        className={` ${theme.sideBarTheme} fixed top-0 ${side}-0 z-40 flex h-full w-[260px] flex-none flex-col space-y-2 p-2  text-[14px] transition-all sm:relative sm:top-0`}
      >
        <div className="flex items-center">
          {!isArhiveView && itemDisplayName !== "Archive" ? (
            <>
              <button
                id={side === "left" ? "new-chat" : "new-prompt"}
                className={`${theme.primaryButtonTheme} text-sidebar flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md p-3 transition-colors duration-200`}
                onClick={() => {
                  handleCreateItem();
                  handleSearchTerm("");
                }}
              >
                <IconPlus size={16} />
                {addItemButtonTitle}
              </button>

              <button
                id={side === "left" ? "new-chat-folder" : "new-prompt-folder"}
                className={`${theme.secondaryButtonTheme} ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md p-3 text-sm transition-colors duration-200`}
                onClick={handleCreateFolder}
              >
                <IconFolderPlus size={16} />
              </button>
            </>
          ) : (
            <div className="flex items-center mt-2">Archives</div>
          )}
        </div>

        <Search
          placeholder={"Search..." || ""}
          searchTerm={searchTerm}
          onSearch={handleSearchTerm}
        />

        <div
          id={side === "left" ? "conversation-container" : "prompt-container"}
          className="flex-grow overflow-auto"
        >
          <div className="flex items-center">{folderDisplayName}</div>
          <div className={`flex ${theme.dividerBottomTheme} pb-2`}>
            {folderComponent}
          </div>

          <div className="flex items-center mt-2">{itemDisplayName}</div>
          {items?.length > 0 ? (
            <div
              className="pt-2"
              onDrop={handleDrop}
              onDragOver={allowDrop}
              onDragEnter={highlightDrop}
              onDragLeave={removeHighlight}
            >
              {itemComponent}
            </div>
          ) : (
            <div className="mt-8 select-none text-center opacity-50">
              <IconMistOff className="mx-auto mb-3" />
              <span className="text-[14px] leading-normal">
                {`No ${itemDisplayName}`}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {side === 'right' && (
            <>
              <div className="pt-1 border-t border-white/20"></div>
              <div className="text-[14px] font-semibold">Current Conversation</div>
              <div className={`text-[12px] flex w-full item-center gap-2 py-1 ${theme.botMsgTextColorTheme}`}>
                <IconListDetails size={20} />
                <span className="font-semibold">Applet: </span>
                <div className="text-end w-full">
                  {taskTitle}
                </div>
              </div>
              {selectedConversation && selectedConversation.messages.length > 0 && (
                <>
                  {collectionName &&
                    <div className={`text-[12px] flex w-full item-center gap-2 py-1 ${theme.botMsgTextColorTheme}`}>
                      <IconBoxMultiple size={20} />
                      <span className="font-semibold">Collection: </span>
                      <div className="text-end w-full">
                        {collectionName}
                      </div>
                    </div>}
                  {qaDocumentTitle &&
                    <div className={`text-[12px] flex w-full item-center gap-2 py-1 ${theme.botMsgTextColorTheme}`}>
                      <IconFileDescription size={20} />
                      <span className="font-semibold">Document:</span>
                      <div className="text-end w-full">
                        {qaDocumentTitle}
                      </div>
                    </div>}
                </>
              )}
            </>
          )}
        </div>
        {footerComponent}
      </div>

      <CloseSidebarButton onClick={toggleOpen} side={side} />
    </div>
  ) : (
    <OpenSidebarButton onClick={toggleOpen} side={side} />
  );
};

export default Sidebar;
