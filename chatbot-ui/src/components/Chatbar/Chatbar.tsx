import { useCallback, useContext, useEffect } from "react";

import { useCreateReducer } from "@/hooks/useCreateReducer";

import { exportData, importData } from "@/utils/app/importExport";

import { Conversation } from "@/types/chat";
import { LatestExportFormat, SupportedExportFormats } from "@/types/export";

import HomeContext from "@/pages/home/home.context";

import { ChatFolders } from "./components/ChatFolders";
import { ChatbarSettings } from "./components/ChatbarSettings";
import { Conversations } from "./components/Conversations";

import Sidebar from "../Sidebar";
import ChatbarContext from "./Chatbar.context";
import { ChatbarInitialState, initialState } from "./Chatbar.state";

import { v4 as uuidv4 } from "uuid";
import { archiveConversations, archiveUnarchiveConversation } from "@/services/HttpService";

export const Chatbar = () => {
  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });

  const {
    state: { conversations, showChatbar, folders, isArchiveView },
    dispatch: homeDispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation,
    
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredConversations },
    dispatch: chatDispatch,
  } = chatBarContextValue;





  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history, folders, prompts }: LatestExportFormat = importData(data);
    homeDispatch({ field: "conversations", value: history });
    homeDispatch({
      field: "selectedConversation",
      value: history[history.length - 1],
    });
    homeDispatch({ field: "folders", value: folders });
    homeDispatch({ field: "prompts", value: prompts });

    window.location.reload();
  };

  const handleClearConversations = () => {
    homeDispatch({
      field: "selectedConversation",
      value: {
        id: uuidv4(),
        name: "New Conversation",
        messages: [],
        folderId: null,
      },
    });
    homeDispatch({ field: "conversations", value: [] });

    archiveConversations().then(() => {
      homeDispatch({ field: "refreshConversations", value: true });
    });
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id
    );

    homeDispatch({ field: "conversations", value: updatedConversations });
    chatDispatch({ field: "searchTerm", value: "" });
    archiveUnarchiveConversation(conversation.id,true).then(() => {
      homeDispatch({ field: "refreshConversations", value: true });
    });

    if (updatedConversations.length > 0) {
      homeDispatch({
        field: "selectedConversation",
        value: updatedConversations[updatedConversations.length - 1],
      });
    } else {
      homeDispatch({
        field: "selectedConversation",
        value: {
          id: uuidv4(),
          name: "New Conversation",
          messages: [],
          folderId: null,
        },
      });
      
    }
  };

  const handleToggleChatbar = () => {
    homeDispatch({ field: "showChatbar", value: !showChatbar });
    localStorage.setItem("showChatbar", JSON.stringify(!showChatbar));
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData("conversation"));
      handleUpdateConversation(conversation, { key: "folderId", value: 0 });
      chatDispatch({ field: "searchTerm", value: "" });
      e.target.style.background = "none";
    }
  };

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: "filteredConversations",
        value: conversations.filter((conversation) => {
          const searchable =
            conversation.title.toLocaleLowerCase() +
            " " +
            conversation.messages.map((message) => message.content).join(" ");
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      chatDispatch({
        field: "filteredConversations",
        value: conversations,
      });
    }
  }, [searchTerm, conversations]);

  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteConversation,
        handleClearConversations,
        handleExportData,
      }}
    >
      <Sidebar<Conversation>
        side={"left"}
        isOpen={showChatbar}
        addItemButtonTitle={"New chat"}
        itemComponent={<Conversations conversations={filteredConversations} />}
        folderComponent={<ChatFolders searchTerm={searchTerm} />}
        items={filteredConversations}
        searchTerm={searchTerm}
        isArchiveView = {isArchiveView}
        folderDisplayName = {isArchiveView ? "Folders" : "Folders"}
        itemDisplayName={isArchiveView ? "Archive" : "Chats"}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: "searchTerm", value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewConversation}
        handleCreateFolder={() => handleCreateFolder("New folder", "chat")}
        handleDrop={handleDrop}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
