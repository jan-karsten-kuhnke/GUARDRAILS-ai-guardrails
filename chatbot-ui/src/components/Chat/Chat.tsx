import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

import { throttle } from "@/utils/data/throttle";
import { Conversation, Message } from "@/types/chat";
import HomeContext from "@/pages/home/home.context";
import { ChatInput } from "./ChatInput";
import { ChatLoader } from "./ChatLoader";
import { MemoizedChatMessage } from "./MemoizedChatMessage";
import AdditionalInputs from "../AdditionalInputs/AdditionalInputs";
import Tiles from "../Tiles/Tiles";
import RequestAccessComponent from "../Tiles/RequestAccess";

import { COLLECTION_PICKER, DOCUMENT_PICKER } from "@/utils/constants";

import {
  anonymizeMessage,
  fetchPrompt,
  requestApproval,
  executeOnDoc,
} from "@/services";
import { getTaskParams, parseChunk, updateMessagesAndConversation} from "@/utils/app/conversation";
interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}
const applicationName: string = import.meta.env.VITE_APPLICATION_NAME;

export let executeOnUploadedDocRef: any;

const containsOnlyWhitespacesOrNewlines = (str: string) => {
  // Check if the string contains only whitespace characters or only newline characters
  return (
    str.trim() === "" ||
    str.split("").every((char) => char === "\n" || char === "\r")
  );
}

export const Chat = memo(({ stopConversationRef }: Props) => {
  const {
    state: {
      selectedConversation,
      conversations,
      theme,
      loading,
      isPrivate,
      selectedTile,
      tiles,
      selectedCollection,
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  executeOnUploadedDocRef = useRef<Object | null>(null);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const [chatTitle, setChatTitle] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (
      message: Message,
      deleteCount = 0,
      formData: FormData = new FormData(),
      document: any = undefined
    ) => {
      if (containsOnlyWhitespacesOrNewlines(message.content)) return;
      message.content = message.content.trim();
      const selectedTask = selectedTile?.code;

      if (selectedTask === "conversation") {
        await anonymizeMessage(message.content)
          .then((res: any) => {
            message.content = res?.data?.result;
          })
          .catch((err) => {
            toast.error(err.message, {
              position: "bottom-right",
              duration: 3000,
            });
            console.log(err.message, "API ERROR");
          });
      }

      if (selectedConversation) {
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }
        homeDispatch({
          field: "selectedConversation",
          value: updatedConversation,
        });
        homeDispatch({ field: "loading", value: true });
        homeDispatch({ field: "messageIsStreaming", value: true });
        const chatBody: any = {
          message: message.content,
        };

        const controller = new AbortController();
        let response: any;
        //params for selected tiles
        let sendCollectionName = false
        let sendDocumentData = false

        selectedTile?.params?.inputs?.forEach((item:any) => {
          const { type } = item;
          if (type === COLLECTION_PICKER) {
            sendCollectionName = true
          }
          else if (type === DOCUMENT_PICKER) {
            sendDocumentData = true
          }
        })
        //renamed qaDocumentId to documentId
        let task_params: any = {
          ...document?.id ? { document } : selectedConversation?.task_params,
        };

        try {
          if (selectedTile.params?.useExecuteOnDoc) {
            toast.loading(
              "Summarization might be a time taking process depending on the size of your document",
              {
                position: "bottom-right",
                duration: 5000,
              }
            );
        
            if (document) { //if selectedTile.params?.useExecuteOnDoc is true
              response = await fetchPrompt(
                chatBody.message,
                selectedConversation.id,
                selectedTask,
                isPrivate,
                task_params
              );
            } else {
              const payload = {
                conversation_id: selectedConversation.id,
                task: selectedTask,
                task_params,
              };
              formData.append("data", JSON.stringify(payload));
              response = await executeOnDoc(formData);
            }
          } else { //if selectedTile.params?.useExecuteOnDoc is false
            response = await fetchPrompt(
              chatBody.message,
              selectedConversation.id,
              selectedTask,
              isPrivate,
              task_params
            );
          }
        } catch (err:any) {
          toast.error(err.message, {
            position: "bottom-right",
            duration: 3000,
          });
          console.log(err);
        }
      
        if (!response.ok) {
          homeDispatch({ field: "loading", value: false });
          homeDispatch({ field: "messageIsStreaming", value: false });
          toast.error(response.statusText);
          return;
        }
        const data = response.body;
        if (!data) {
          homeDispatch({ field: "loading", value: false });
          homeDispatch({ field: "messageIsStreaming", value: false });
          return;
        }

        homeDispatch({ field: "loading", value: false });
        const reader = data.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let isFirst = true;
        let text = "";
        let msg_info = null;
        let role;
        while (!done) {
          if (stopConversationRef.current === true) {
            controller.abort();
            done = true;
            break;
          }
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value); // stores role, content, msg_info (JSON String)
          if (!chunkValue || chunkValue === "") continue;
          let parsed = parseChunk(chunkValue, text, msg_info, role);
          role = parsed.role;
          msg_info = parsed.msg_info;
          text += parsed.content;
        
          updateMessagesAndConversation(isFirst, homeDispatch, updatedConversation, text, role, msg_info, parsed)
        }
        homeDispatch({ field: "messageIsStreaming", value: false });
      }
    },
    [conversations, selectedConversation, stopConversationRef, isPrivate, selectedTile, selectedCollection]
  );

  const handleRequestApproval = async (conversationId: string) => {
    homeDispatch({ field: "loading", value: true });
    homeDispatch({ field: "messageIsStreaming", value: true });

    let { data } = await requestApproval(conversationId);
    let message: Message = {
      role: "guardrails",
      content: data.message,
      msg_info: null,
      userActionRequired: false,
    };

    let updatedConversation = {
      ...selectedConversation,
      messages: selectedConversation?.messages
        ? [...selectedConversation?.messages, message]
        : [message],
    };

    homeDispatch({
      field: "selectedConversation",
      value: updatedConversation,
    });
    homeDispatch({ field: "loading", value: false });
    homeDispatch({ field: "messageIsStreaming", value: false });
  };

  // const scrollToBottom = useCallback(() => {
  //   if (autoScrollEnabled) {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //     textareaRef.current?.focus();
  //   }
  // }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    if (executeOnUploadedDocRef.current) {
      let message: Message = {
        role: "user",
        content: executeOnUploadedDocRef.current.title,
        userActionRequired: false,
        msg_info: null,
      };
      handleSend(message, 0, undefined, executeOnUploadedDocRef.current.document)
      executeOnUploadedDocRef.current = null;
    }

  }, [executeOnUploadedDocRef.current])

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2]
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      }
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  useEffect(() => {
    // Checking for new chat
    if(selectedConversation?.messages.length === 0){
      setChatTitle(selectedTile.title);
    }
    // for an existing chat
    else{
      const selectedTask = tiles.find(tile => tile.code === selectedConversation?.task);
      if(selectedTask){
        setChatTitle(selectedTask.title);
      }
    }
  },[selectedConversation,selectedTile]);

  // useEffect(() => {
  //   const foundTile = tiles.find((tile) => tile.code === selectedConversation?.task);
  //   if (foundTile) {
  //     handleSelectedTile(foundTile);
  //   }

  //   if(selectedConversation?.task_params && selectedConversation?.task_params?.collectionName){
  //     homeDispatch({field: "selectedCollection", value: selectedConversation?.task_params?.collectionName})
  //   }

  //   if(selectedConversation?.task_params && selectedConversation?.task_params?.documentId){
  //     homeDispatch({field: "selectedDocument", value: {id:selectedConversation?.task_params?.documentId, title:selectedConversation?.task_params?.documentName}})
  //   }
  //   else{
  //     homeDispatch({field: "selectedDocument", value: undefined})
  //   }
  // },[selectedConversation])

  return (
    <div className={`relative flex-1 overflow-hidden ${theme.chatBackground}`}>
      <>
        <div
          className="max-h-full overflow-x-hidden"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {selectedConversation?.messages.length === 0 ? (
            <>
              <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[800px]">
                <div className="text-center text-3xl font-semibold">
                  <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[800px]">
                    <div
                      className={`text-center text-4xl font-bold text-[${theme.textColor}]`}
                    >
                      Welcome to {applicationName}
                    </div>
                    <div
                      className={`text-center text-2xl font-bold text-[${theme.textColorSecondary}]`}
                    >
                      {/* Protect your Confidential Information. */}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-full rounded-lg ${theme.chatItemsBorder}`}
                  id="tiles-container"
                >
                  <Tiles />
                </div>

                {Object.keys(selectedTile).length && !selectedTile?.has_access ? (
                  <div
                    className={`flex w-full w-full justify-center rounded-lg py-2 ${theme.chatItemsBorder}`}
                  >
                    <RequestAccessComponent />
                  </div>
                ) : (
                  ""
                )}
                {selectedTile?.params &&
                  selectedTile?.params?.inputs?.length > 0 ? (
                  <div
                    className={`w-full justify-center rounded-lg p-4 ${theme.chatItemsBorder}`}
                  >
                    <AdditionalInputs
                      inputs={selectedTile?.params?.inputs}
                      handleSend={handleSend}
                    />
                  </div>
                ) : ""}

                {/*Disable PublicPrivateSwitch component
                   Note:Don't uncomment the bellow commected code
                */}

                {/* {selectedTile?.has_access ? (
                  <div
                    className={`w-full justify-center rounded-lg p-4 ${theme.chatItemsBorder}`}
                  >
                    <PublicPrivateSwitch size={40} />
                  </div>
                ) : (
                  ""
                )} */}
              </div>
            </>
          ) : (
            <>
              <div
                className={`sticky top-0 z-10 flex justify-center py-4 ${theme.chatTitleTheme}`}
              >
                {chatTitle}
              </div>
              {selectedConversation?.messages.map((message, index) => (
                <MemoizedChatMessage
                  key={index}
                  message={message}
                  messageIndex={index}
                  onEdit={(editedMessage) => {
                    setCurrentMessage(editedMessage);
                    // discard edited message and the ones that come after then resend
                    handleSend(
                      editedMessage,
                      selectedConversation?.messages.length - index
                    );
                  }}
                  onOverRide={(selectedMessage) => {
                    setCurrentMessage(selectedMessage);
                    // discard edited message and the ones that come after then resend
                    handleSend(
                      selectedMessage,
                      selectedConversation?.messages.length - index
                    );
                  }}
                  onRequestApproval={(conversationId) => {
                    handleRequestApproval(conversationId);
                  }}
                />
              ))}

              {loading && <ChatLoader />}

              <div
                className={`h-[162px] ${theme.chatBackground}}`}
                ref={messagesEndRef}
              />
            </>
          )}
        </div>
        {selectedTile.params?.executor != "summarize"  && selectedTile.params?.executor != "extraction" && (
          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            onSend={(message) => {
              setCurrentMessage(message);
              handleSend(message, 0);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={() => {
              if (currentMessage) {
                handleSend(currentMessage, 2);
              }
            }}
            showScrollDownButton={showScrollDownButton}
          />
        )}
      </>
    </div>
  );
});
Chat.displayName = "Chat";
