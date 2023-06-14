import {
    IconRobot,
    IconUser,
    IconShieldExclamation,
  } from "@tabler/icons-react";


  export type Role = 'assistant' | 'user' | 'guardrails';
  export interface Message {
    role: Role;
    content: string;
    userActionRequired: boolean;
  }

  export interface Props {
    message: Message;
    messageIndex: number;
  }

export const ChatMessage =(props:Props)=>{
    return (
        <div
          className={`group md:px-4`}
          style={{
            overflowWrap: "anywhere",
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            borderBottomColor: 'rgba(0, 0, 0, 0.1)',
            color: '#d1cac5',
            width:"100%",
            borderRadius:"2px",
            backgroundColor: props.message.role === 'assistant' || props.message.role === 'guardrails' ? '#444654' : '#343541',
            
          }}
        >
          <div className="relative m-auto flex p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
            <div className="min-w-[40px] text-right font-bold">
              {props.message.role === "assistant" ? (
                <IconRobot size={30} />
              ) : props.message.role === "guardrails" ? (
                <IconShieldExclamation size={30} />
              ) : (
                <IconUser size={30} />
              )}
            </div>
  
            <div className="prose mt-[-2px] w-full dark:prose-invert">
              {props.message.role === "user" ? (
                <div className="flex w-full">
                 <div className="prose whitespace-pre-wrap dark:prose-invert flex-1" style={{color:"#d1cac5"}}>
                      {props.message.content}
                    </div>
                  
                </div>
              ) : props.message.role === "guardrails" ? (
                <>
                  <div className="prose whitespace-pre-wrap dark:prose-invert flex-1" style={{color:"#d1cac5"}}>
                    {props.message.content}
                   
                  </div>
                </>
              ) : (
                <>
                <div className="prose whitespace-pre-wrap dark:prose-invert flex-1" style={{color:"#d1cac5"}}>
                  {props.message.content}
                 
                </div>
              </>
              )}
            </div>
          </div>
        </div>
      );
    }
 