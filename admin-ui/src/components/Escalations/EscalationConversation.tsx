import {
    IconRobot,
    IconUser,
    IconShieldExclamation,
  } from "@tabler/icons-react";
  import { Button, Container, Typography ,Grid} from '@mui/material';
  import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';


  export interface Props {
    selectedRow: any;
    handleClose:any;
  }
  export interface Message {
    role: Role;
    content: string;
    userActionRequired: boolean;
  }
export type Role = 'assistant' | 'user' | 'guardrails';


export const EscalationConversation =(props:Props)=>{
    return (
      <Container 
            sx={{
              backgroundColor: "#202123",
              paddingBottom:"15px",
              paddingTop:"5px",
              borderRadius: '2px',
              width: "100%",
              }}>
            <div style={{display:"flex" ,justifyContent:"space-between" ,margin:"10px"}}>
              <div style={{fontSize:"1.8em", color:"#d1cac5", cursor: "pointer"}}>
                <KeyboardBackspaceOutlinedIcon onClick={props.handleClose} />
              </div>
              <div style={{fontSize:"1.8em", color:"#d1cac5"}}>
                {props.selectedRow?.title}
              </div>
              <div></div>
            </div>

                {props.selectedRow?.messages.map((message:Message, index:number) =>(
                  <div
                  className={`group md:px-4`}
                  style={{
                    overflowWrap: "anywhere",
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
                    color: '#d1cac5',
                    width:"100%",
                    borderRadius:"2px",
                    backgroundColor: message.role === 'assistant' || message.role === 'guardrails' ? '#444654' : '#343541',
                    
                  }}
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
          
                    <div className="prose mt-[-2px] w-full dark:prose-invert">
                      {message.role === "user" ? (
                        <div className="flex w-full">
                         <div className="prose whitespace-pre-wrap dark:prose-invert flex-1" style={{color:"#d1cac5"}}>
                              {message.content}
                            </div>
                          
                        </div>
                      ) : message.role === "guardrails" ? (
                        <>
                          <div className="prose whitespace-pre-wrap dark:prose-invert flex-1" style={{color:"#d1cac5"}}>
                            {message.content}
                           
                          </div>
                        </>
                      ) : (
                        <>
                        <div className="prose whitespace-pre-wrap dark:prose-invert flex-1" style={{color:"#d1cac5"}}>
                          {message.content}
                         
                        </div>
                      </>
                      )}
                    </div>
                  </div>
                </div>
                ))}
                
           </Container>
      );
    }
 