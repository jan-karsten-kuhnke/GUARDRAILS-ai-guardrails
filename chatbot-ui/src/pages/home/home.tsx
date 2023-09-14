import { Chatbar } from "@/components/Chatbar/Chatbar";
import Promptbar from "@/components/Promptbar";
import { HomeInitialState, initialState } from "./home.state";
import HomeContext from "./home.context";
import { useCreateReducer } from "@/hooks/useCreateReducer";
import { Navbar } from "@/components/Mobile/Navbar";
import { Chat } from "@/components/Chat/Chat";
import { useEffect, useRef, useState } from "react";
import { Conversation, UserFeedback } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";
import {
  fetchAllConversations,
  fetchConversationById,
  fetchFolders,
  fetchPrompts,
  updateConversationProperties,
  updateUserFolders,
  updateUserPrompts,
  getEulaStatus,
} from "@/services/HttpService";
import OnboardingGuide from "@/components/OnboardingGuide/OnboardingGuide";
import { cleanConversationHistory } from "@/utils/app/clean";
import { FolderInterface, FolderType } from "@/types/folder";
import { KeyValuePair } from "@/types/data";
import { Prompt } from "@/types/prompt";
import { Tile } from "@/types/tiles";
import { EulaDialog } from "@/components/EulaDialog/EulaDialog";
import { ThemeProvider, createTheme } from "@mui/material";
import { getTaskParams } from "@/utils/app/conversation";
import { getCollections } from "@/services/DocsService";

export const Home = () => {
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const [eulaStatus, setEulaStatus] = useState<boolean>(true);

  const stopConversationRef = useRef<boolean>(false);
  const {
    state: {
      theme,
      folders,
      conversations,
      selectedConversation,
      prompts,
      refreshConversations,
      isArchiveView,
      showOnboardingGuide,
      selectedTile,
      collections,
      selectedCollection
    },
    dispatch,
  } = contextValue;

  const muiComponentTheme = createTheme({
    palette: {
      primary: {
        main: theme.dataGridTheme.primaryColor, // Change this to your desired primary color
      },
    },
  });

  const handleGetCollections = () => {
    getCollections().then((res) => {
      if (res && res.data && res.data.success) {
        dispatch({ field: "collections", value: res?.data?.data });
        if (!selectedCollection) {
          dispatch({
            field: "selectedCollection",
            value: res?.data?.data[0]?.name,
          });
        }
      }
    });
  } 

  const handleEulaDialogClose = () => {
    setEulaStatus(true);
    dispatch({ field: "showOnboardingGuide", value: true });
  };

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    dispatch({ field: "folders", value: updatedFolders });

    updateUserFolders(updatedFolders);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    dispatch({ field: "folders", value: updatedFolders });

    updateUserFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    dispatch({ field: "folders", value: updatedFolders });
    updateUserFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        updateConversationProperties(c.id, c.title, null);
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });

    dispatch({ field: "conversations", value: updatedConversations });

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch({ field: "prompts", value: updatedPrompts });
    updateUserPrompts(updatedPrompts);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    fetchConversationById(conversation.id).then((res) => {
      conversation.messages = res.data.messages.map(
        (message: {
          id: string;
          user_feedback: UserFeedback;
          role: any;
          content: any;
          user_action_required: any;
          msg_info: any;
        }) => ({
          id: message.id,
          role: message.role,
          user_feedback: message.user_feedback,
          content: message.content,
          userActionRequired: message.user_action_required,
          msg_info: message.msg_info,
        })
      );
      dispatch({
        field: "selectedConversation",
        value: conversation,
      });
    });

    // saveConversation(conversation);
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };
    dispatch({ field: "selectedConversation", value: updatedConversation });
    dispatch({
      field: "conversations",
      value: conversations.map((c) =>
        c.id === updatedConversation.id ? updatedConversation : c
      ),
    });
    updateConversationProperties(
      updatedConversation.id,
      updatedConversation.title,
      updatedConversation.folderId
    ).then((res) => {
      dispatch({ field: "refreshConversations", value: true });
    });
  };

  const handleUpdateSelectedConversation = (
    data: KeyValuePair
  ) => {
    const updatedConversation = {
      ...selectedConversation,
      [data.key]: data.value,
    };
    dispatch({ field: "selectedConversation", value: updatedConversation });
  
  };

  const handleNewConversation = () => {
    const conversation = {
      id: uuidv4(),
      title: "New Conversation",
      messages: [],
      folderId: null,
      task_params: getTaskParams(selectedTile?.params?.inputs,collections)
    };
    dispatch({
      field: "conversations",
      value: [conversation, ...conversations],
    });
    dispatch({ field: "selectedConversation", value: conversation });
  };


  const handleIsPrivate = (isPrivate: boolean) => {
    dispatch({ field: "isPrivate", value: isPrivate });
  };

  const handleSelectedTile = (tile: Tile) => {
    dispatch({ field: "selectedTile", value: tile });
    handleUpdateSelectedConversation({key:"task_params",value:getTaskParams(tile?.params?.inputs,collections)})
  };

  // on load
  useEffect(() => {
    //set a blank  new conversation
    dispatch({
      field: "selectedConversation",
      value: {
        id: uuidv4(),
        name: "New Conversation",
        messages: [],
        folderId: null,
        task_params:{}
      },
    });

    fetchAllConversations(false).then((res) => {
      const conversationHistory = res.data;
      const cleanedConversationHistory =
        cleanConversationHistory(conversationHistory);

      dispatch({ field: "conversations", value: cleanedConversationHistory });
    });

    fetchFolders().then((res) => {
      if (res && res.data && res.data.folders)
        dispatch({ field: "folders", value: res.data.folders });
    });

    fetchPrompts().then((res) => {
      if (res && res.data && res.data.prompts)
        dispatch({ field: "prompts", value: res.data.prompts });
    });

    getEulaStatus().then((res) => {
      if (res && res.data && res.data.success) {
        setEulaStatus(res.data.data.eula);
      }
    });

    handleGetCollections();

    // fetchPrompts().then((res) => {
    //   dispatch({ field: "prompts", value: res.data });
    // });
  }, []);

  useEffect(() => {
    if (refreshConversations) {
      fetchAllConversations(isArchiveView).then((res) => {
        const conversationHistory = res.data;
        const cleanedConversationHistory =
          cleanConversationHistory(conversationHistory);
        dispatch({ field: "conversations", value: cleanedConversationHistory });
        dispatch({ field: "refreshConversations", value: false });
      });
    }
  }, [refreshConversations]);

  useEffect(() => {
    dispatch({ field: "refreshConversations", value: true });
  }, [isArchiveView]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation,
        handleIsPrivate,
        handleSelectedTile,
        handleUpdateSelectedConversation,
        handleGetCollections,
      }}
    >
      <ThemeProvider theme={muiComponentTheme}>
      <main className={`flex h-screen w-screen flex-col text-sm text-white`}>
        {showOnboardingGuide && <OnboardingGuide />}
        <div className="fixed top-0 w-full sm:hidden">
          {/* <Navbar
            selectedConversation={selectedConversation}
            onNewConversation={handleNewConversation}
          /> */}
        </div>
        {!eulaStatus && <EulaDialog onClose={handleEulaDialogClose} />}

        <div className="flex h-full w-full pt-[48px] sm:pt-0">
          <Chatbar />

          <div className="flex flex-1">
            <Chat stopConversationRef={stopConversationRef} />
          </div>

          <Promptbar />
        </div>
      </main>
      </ThemeProvider>
    </HomeContext.Provider>
  );
};
