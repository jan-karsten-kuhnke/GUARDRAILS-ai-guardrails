import {
  IconClearAll,
  IconSettings,
} from "@tabler/icons-react";
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

// import { getEndpoint } from '@/utils/app/api';
import { updateConversation } from "@/utils/app/conversation";
import { throttle } from "@/utils/data/throttle";

import { ChatBody, Conversation, Message } from "@/types/chat";

import HomeContext from "@/pages/home/home.context";

import Spinner from "../Spinner";
import { ChatInput } from "./ChatInput";
import { ChatLoader } from "./ChatLoader";
import { ErrorMessageDiv } from "./ErrorMessageDiv";
import { ModelSelect } from "./ModelSelect";
import { SystemPrompt } from "./SystemPrompt";
import { TemperatureSlider } from "./Temperature";
import { MemoizedChatMessage } from "./MemoizedChatMessage";
import { anonymizeMessage, fetchPrompt, requestApproval } from "@/services";
import PublicPrivateSwitch from "../PublicPrivateSwitch";
import AdditionalInputs from "../AdditionalInputs/AdditionalInputs";
import { summarizeBrief } from "@/services";
import  Tiles from "../Tiles/Tiles";
interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}
const applicationName: string = import.meta.env.VITE_APPLICATION_NAME;

export const Chat = memo(({ stopConversationRef }: Props) => {
  function containsOnlyWhitespacesOrNewlines(str: string) {
    // Check if the string contains only whitespace characters or only newline characters
    return (
      str.trim() === "" ||
      str.split("").every((char) => char === "\n" || char === "\r")
    );
  }
  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKey,
      pluginKeys,
      serverSideApiKeyIsSet,
      messageIsStreaming,
      modelError,
      theme,
      loading,
      prompts,
      isPrivate,
      selectedTile,
    },
    handleUpdateConversation,
    handleIsPrivate,
    handleSelectedTile,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, isOverRide: boolean = false , formData : FormData = new FormData()) => {
      if (containsOnlyWhitespacesOrNewlines(message.content)) return;
      message.content = message.content.trim();
      if (selectedTile.code === "conversation") {
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

        if(selectedTile.code === "summarize-brief"){
          try {
            const payload = {
            conversation_id: selectedConversation.id,
            isOverride: isOverRide,
            task: selectedTile.code,
            }
            formData.append("data", JSON.stringify(payload));
            toast.loading("Summarization might be a time taking process depending on the size of your document", {
              position: "bottom-right",
              duration: 5000,
            });
            response = await summarizeBrief(formData);
          } catch (err: any) {
            toast.error(err.message, {
              position: "bottom-right",
              duration: 3000,
            });
            console.log(err)
          }
        }
        else{
          if (isOverRide) {
            try {
              response = await fetchPrompt(
                updatedConversation.messages[
                  updatedConversation.messages.length - 2
                ].content,
                selectedConversation.id,
                isOverRide,
                selectedTile.code,
                isPrivate
              );
            } catch (err: any) {
              toast.error(err.message, {
                position: "bottom-right",
                duration: 3000,
              });
            }
          } else {
            try {
              response = await fetchPrompt(
                chatBody.message,
                selectedConversation.id,
                isOverRide,
                selectedTile.code,
                isPrivate
              );
            } catch (err: any) {
              toast.error(err.message, {
                position: "bottom-right",
                duration: 3000,
              });
            }
          }
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
          const chunkValue = decoder.decode(value);
          let parsed;
          if (!chunkValue || chunkValue === "") continue;
          if (chunkValue.includes("}{")) {
            var split = chunkValue.split("}{");
            for (var i = 0; i < split.length; i++) {
              if (i === 0) {
                parsed = JSON.parse(split[i] + "}");
              } else if (i === split.length - 1) {
                parsed = JSON.parse("{" + split[i]);
              } else {
                parsed = JSON.parse("{" + split[i] + "}");
              }

              if (parsed.content == undefined) {
                text =
                  "Sorry currently your request could not be fullfiled. Please try again.!";
              } else {
                text += parsed.content;
              }
              msg_info = parsed.msg_info;
              role = parsed.role;
            }
          } else {
            parsed = JSON.parse(chunkValue);
            if (parsed.content == undefined) {
              text =
                "Sorry currently your request could not be fullfiled. Please try again.!";
            } else {
              text += parsed.content;
            }
            msg_info = parsed.msg_info;
            role = parsed.role;
          }
          if (isFirst) {
            isFirst = false;
            homeDispatch({ field: "refreshConversations", value: true });
            const updatedMessages: Message[] = updatedConversation.messages.map(
              (message, index) => {
                return {
                  ...message,
                  userActionRequired: false,
                };
              }
            );
            if (isOverRide) {
              updatedMessages.push({
                role: "guardrails",
                content:
                  "You chose to Override the warning, proceeding to Open AI.",
                msg_info: msg_info,
                userActionRequired: false,
              });
            }
            updatedMessages.push({
              role: role,
              content: text,
              msg_info: msg_info,
              userActionRequired: parsed.user_action_required,
            });
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
            homeDispatch({
              field: "selectedConversation",
              value: updatedConversation,
            });
          } else {
            const updatedMessages: Message[] = updatedConversation.messages.map(
              (message, index) => {
                if (index === updatedConversation.messages.length - 1) {
                  return {
                    ...message,
                    content: text,
                  };
                }
                return message;
              }
            );
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
            homeDispatch({
              field: "selectedConversation",
              value: updatedConversation,
            });
          }
        }

        homeDispatch({ field: "messageIsStreaming", value: false });
      }
    },
    [
      apiKey,
      conversations,
      pluginKeys,
      selectedConversation,
      stopConversationRef,
      isPrivate,
      selectedTile,
    ]
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

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

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

  // const handleSettings = () => {
  //   setShowSettings(!showSettings);
  // };

  // const onClearAll = () => {
  //   if (
  //     confirm(('Are you sure you want to clear all messages?')) &&
  //     selectedConversation
  //   ) {
  //     handleUpdateConversation(selectedConversation, {
  //       key: 'messages',
  //       value: [],
  //     });
  //   }
  // };


  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

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
              <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
                <div className="text-center text-3xl font-semibold">
                  {models.length === 0 ? (
                    <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
                      <div className={`text-center text-4xl font-bold ${theme.textColor}`}>
                        Welcome to {applicationName}
                      </div>
                      <div className={`text-center text-2xl font-bold ${theme.textColorSecondary}`}>
                        Protect your Confidential Information.
                      </div>
                    </div>
                  ) : (
                    "Chatbot UI"
                  )}
                </div>
                <div className={`flex w-full w-full justify-center rounded-lg py-2 ${theme.chatItemsBorder}`}>
                  <Tiles/>
                </div>
                {selectedTile?.params && selectedTile?.params?.inputs?.length > 0 && (
                  <div className={`w-full justify-center rounded-lg p-4 ${theme.chatItemsBorder}`}>
                    <AdditionalInputs inputs={selectedTile?.params?.inputs} handleSend={handleSend} />
                  </div>
                )}
                <div className={`w-full justify-center rounded-lg p-4 ${theme.chatItemsBorder}`}>
                  <PublicPrivateSwitch size={40} />
                </div>
{/* 
                {models.length > 0 && (
                  <div className={`flex h-full flex-col space-y-4 rounded-lg p-4 ${theme.chatItemsBorder}`}>
                    <ModelSelect />

                    <SystemPrompt
                      conversation={selectedConversation}
                      prompts={prompts}
                      onChangePrompt={(prompt) =>
                        handleUpdateConversation(selectedConversation, {
                          key: "prompt",
                          value: prompt,
                        })
                      }
                    />

                    <TemperatureSlider
                      label={"Temperature"}
                      onChangeTemperature={(temperature) =>
                        handleUpdateConversation(selectedConversation, {
                          key: "temperature",
                          value: temperature,
                        })
                      }
                    />
                  </div>
                )} */}
              </div>
            </>
          ) : (
            <>
              <div className={`sticky top-0 z-10 flex justify-center py-2 text-sm ${theme.chatTitleTheme}`}>
                {selectedConversation?.title}

                {/* <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={handleSettings}
                  >
                    <IconSettings size={18} />
                  </button>
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={onClearAll}
                  >
                    <IconClearAll size={18} />
                  </button> */}
              </div>
              {/* {showSettings && (
                <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                  <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                    <ModelSelect />
                  </div>
                </div>
              )} */}

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
                      selectedConversation?.messages.length - index,
                      true
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
          {selectedTile?.code != "summarize-brief" && 
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
        }
      </>
    </div>
  );
});
Chat.displayName = "Chat";
