import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconRobot,
  IconTrash,
  IconUser,
  IconShieldExclamation,
} from "@tabler/icons-react";
import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { updateConversation } from "@/utils/app/conversation";

import { Message } from "@/types/chat";

import HomeContext from "@/pages/home/home.context";

import { CodeBlock } from "../Markdown/CodeBlock";
import { MemoizedReactMarkdown } from "../Markdown/MemoizedReactMarkdown";
import { SourceTabBar } from "./SourceTabBar";

import rehypeMathjax from "rehype-mathjax";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import Visualization from "./components/Visualization";
import { isDark } from '@/styles';
import FeedbackComponent from "./FeedbackComponent";

export interface Props {
  message: Message;
  messageIndex: number;
  onEdit?: (editedMessage: Message) => void;
  onOverRide?: (selectedMessage: Message) => void;
  onRequestApproval?: (conversationId: string) => void;
}

export interface AssistantProps {
  content: string;
}

export const ChatMessage: FC<Props> = memo(
  ({ message, messageIndex, onEdit, onOverRide, onRequestApproval }) => {
    const {
      state: {
        selectedConversation,
        conversations,
        currentMessage,
        theme,
        messageIsStreaming,
      },
      dispatch: homeDispatch,
    } = useContext(HomeContext);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [messageContent, setMessageContent] = useState(message.content);
    const [messagedCopied, setMessageCopied] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const sources = useCallback(
      message.msg_info?.sources?.map((source: any, index: number) => {
        source = JSON.parse(source);
        return {
          fileName: source["metadata"]["source"],
          doc: source["doc"],
        };
      }),
      [message.msg_info?.sources]
    );

    const toggleEditing = () => {
      setIsEditing(!isEditing);
    };

    const handleInputChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      setMessageContent(event.target.value);
      if (textareaRef.current) {
        textareaRef.current.style.height = "inherit";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    const handleEditMessage = () => {
      if (message.content != messageContent) {
        if (selectedConversation && onEdit) {
          onEdit({ ...message, content: messageContent });
        }
      }
      setIsEditing(false);
    };

    const handleDeleteMessage = () => {
      if (!selectedConversation) return;

      const { messages } = selectedConversation;
      const findIndex = messages.findIndex((elm) => elm === message);

      if (findIndex < 0) return;

      if (
        findIndex < messages.length - 1 &&
        messages[findIndex + 1].role === "assistant"
      ) {
        messages.splice(findIndex, 2);
      } else {
        messages.splice(findIndex, 1);
      }
      const updatedConversation = {
        ...selectedConversation,
        messages,
      };

      const { single, all } = updateConversation(
        updatedConversation,
        conversations
      );
      homeDispatch({ field: "selectedConversation", value: single });
      homeDispatch({ field: "conversations", value: all });
    };

    const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !isTyping && !e.shiftKey) {
        e.preventDefault();
        handleEditMessage();
      }
    };

    const copyOnClick = () => {
      if (!navigator.clipboard) return;

      navigator.clipboard.writeText(message.content).then(() => {
        setMessageCopied(true);
        setTimeout(() => {
          setMessageCopied(false);
        }, 2000);
      });
    };

    useEffect(() => {
      setMessageContent(message.content);
    }, [message.content]);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "inherit";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    const [value, setValue] = useState("1");

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
      setValue(newValue);
    };

    const style = {
      padding: "1.5em 0px 0px 0px",
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
    };

    return (
      <div
        className={`group md:px-4 ${message.role === "assistant" || message.role === "guardrails"
          ? `border-b border-black/10  ${theme.chatMessageTheme}`
          : `border-b border-black/10 ${theme.chatMessageThemeUser} `
          }`}
        style={{ overflowWrap: "anywhere" }}
      >
        <div className="relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
          <div className="min-w-[40px] text-right font-bold">
            {message.role === "assistant" ? (
              <IconRobot size={30} />
            ) : message.role === "guardrails" ? (
              <IconShieldExclamation size={30} />
            ) : (
              <IconUser size={30} />
            )}
          </div>

          <div className={`prose mt-[-2px] w-full dark:prose-invert ${isDark ? `dark ` : ' '}`}>
            {message.role === "user" ? (
              <div className="flex w-full">
                {isEditing ? (
                  <div className="flex w-full flex-col">
                    <textarea
                      ref={textareaRef}
                      className="w-full resize-none whitespace-pre-wrap border-none dark:bg-[#343541]"
                      value={messageContent}
                      onChange={handleInputChange}
                      onKeyDown={handlePressEnter}
                      onCompositionStart={() => setIsTyping(true)}
                      onCompositionEnd={() => setIsTyping(false)}
                      style={{
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        lineHeight: "inherit",
                        padding: "0",
                        margin: "0",
                        overflow: "hidden",
                      }}
                    />

                    <div className="mt-10 flex justify-center space-x-4">
                      <button
                        className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                        onClick={handleEditMessage}
                        disabled={messageContent.trim().length <= 0}
                      >
                        {"Save & Submit"}
                      </button>
                      <button
                        className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        onClick={() => {
                          setMessageContent(message.content);
                          setIsEditing(false);
                        }}
                      >
                        {"Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`prose whitespace-pre-wrap dark:prose-invert flex-1 text-[${theme.textColor}] font-normal`}
                  >
                    {message.content}
                  </div>
                )}

                {/* {!isEditing && (
                <div className="md:-mr-8 ml-1 md:ml-0 flex flex-col md:flex-row gap-4 md:gap-1 items-center md:items-start justify-end md:justify-start">
                  <button
                    className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={toggleEditing}
                  >
                    <IconEdit size={20} />
                  </button>
                  <button
                    className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={handleDeleteMessage}
                  >
                    <IconTrash size={20} />
                  </button>
                </div>
              )} */}
              </div>
            ) : message.role === "guardrails" ? (
              <>
                <div
                  className={`prose whitespace-pre-wrap dark:prose-invert flex-1 text-[${theme.textColor}]`}
                >
                  {message.content}
                  {message.userActionRequired &&
                    messageIndex ===
                    (selectedConversation?.messages.length ?? 0) - 1 && (
                      <div className="flex">
                        <button
                          className={` mt-1 flex w-[190px] flex-shrink-0 cursor-pointer gap-3 rounded-md  p-3  py-2 px-4  md:mb-0 md:mt-2 ${theme.primaryButtonTheme}`}
                          onClick={() => {
                            if (onOverRide) onOverRide(message);
                          }}
                        >
                          Override
                        </button>

                        <button
                          className={` mt-1 ml-3 flex w-[190px] flex-shrink-0 cursor-pointer gap-3 rounded-md p-3 py-2 px-4   md:mb-0 md:mt-2  ${theme.primaryButtonTheme}`}
                          onClick={() => {
                            if (onRequestApproval && selectedConversation)
                              onRequestApproval(selectedConversation?.id);
                          }}
                        >
                          Request Approval
                        </button>
                      </div>
                    )}
                </div>
              </>
            ) : (
              <div>
                <div className="flex flex-row">
                  {sources && sources.length > 0 ? (
                    <Box sx={{ width: "100%", overflow: "auto", typography: "body1" }}>
                      <TabContext value={value}>
                        <Box
                          sx={{
                            borderBottom: 1,
                            borderColor: "divider",
                            color: theme.tabTheme.color,
                          }}
                        >
                          <TabList
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                              "& .MuiTab-root": {
                                fontFamily: "'Inter', sans-serif", // Set the font-family
                                fontWeight: 600,
                                color: theme.tabTheme.color,
                                textTransform: "Capitalize",
                                paddingTop: "0px",
                                overflowY: "scroll",
                              },
                              "& .MuiButtonBase-root.Mui-selected": {
                                color: theme.tabTheme.color,
                              },
                              "& .MuiTabs-indicator": {
                                backgroundColor: theme.tabTheme.color,
                              },
                            }}
                          >
                            <Tab label="Answer" value="1" />
                            <Tab label="Sources" value="2" />
                          </TabList>
                        </Box>
                        <TabPanel value="1" sx={style}>
                          <AssistantMessage content={message.content} />
                        </TabPanel>
                        <TabPanel value="2" sx={style}>
                          <SourceTabBar sources={sources} />
                        </TabPanel>
                      </TabContext>
                    </Box>
                  ) : (
                    <>
                      {message.msg_info?.visualization ? (
                        <Visualization
                          content={message.msg_info?.visualization}
                          dataset={message.msg_info?.dataset}
                        />
                      ) : (
                        <AssistantMessage content={message.content} />
                      )}
                    </>
                  )}

                  <div className="md:-mr-8 ml-1 md:ml-0 flex flex-col md:flex-row gap-4 md:gap-1 items-center md:items-start justify-end md:justify-start">
                    {messagedCopied ? (
                      <IconCheck
                        size={20}
                        className="text-green-500 dark:text-green-400"
                      />
                    ) : (
                      <button
                        className="invisible group-hover:visible focus:visible text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={copyOnClick}
                      >
                        <IconCopy size={20} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <FeedbackComponent id={message.id}/>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export const AssistantMessage: FC<AssistantProps> = ({ content }) => {
  const {
    state: { theme },
  } = useContext(HomeContext);
  return (
    // <div>
    <MemoizedReactMarkdown
      className={`prose dark:prose-invert ${isDark ? `dark ` : ''}flex-1 ${theme.botMsgTextColorTheme} font-normal`}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeMathjax]}
      components={{
        code({ node, inline, className, children, ...props }) {
          if (children.length) {
            if (children[0] == "▍") {
              return (
                <span className="animate-bounce cursor-default mt-1 flex items-center ml-2">
                  <div className={`w-3 h-3 ${theme.bgLoader} mr-1 rounded-full`}></div>
                  <div className={`w-3 h-3 ${theme.bgLoader} mr-1 rounded-full`}></div>
                  <div className={`w-3 h-3 ${theme.bgLoader} mr-1 rounded-full`}></div>
                </span>
              );
            }

            children[0] = (children[0] as string).replace("`▍`", "▍");
          }

          const match = /language-(\w+)/.exec(className || "");

          return !inline ? (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(children).replace(/\n$/, "")}
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <table className="border-collapse border border-black px-3 py-1 dark:border-white">
              {children}
            </table>
          );
        },
        th({ children }) {
          return (
            <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="break-words border border-black px-3 py-1 dark:border-white">
              {children}
            </td>
          );
        },
      }}
    >
      {/* {`${content}${
        messageIsStreaming &&
        messageIndex == (selectedConversation?.messages.length ?? 0) - 1
          ? "`▍`"
          : ""
      }`} */}
      {`${content}`}
    </MemoizedReactMarkdown>

  );
};


ChatMessage.displayName = "ChatMessage";
