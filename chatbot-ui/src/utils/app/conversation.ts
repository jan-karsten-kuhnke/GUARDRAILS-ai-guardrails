import { Conversation } from '@/types/chat';

export const updateConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[],
) => {
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};

export const parseChunk = (chunkValue : any, text: any, msg_info : any, role : any) => {
  
  let parsed = null; 

  if (chunkValue.includes("}{")) {
    const split = chunkValue.split("}{");
    split.forEach((chunk : string, index : number) => {
      console.log("chunk in conversation.ts", chunk)
      const jsonChunk = (index === 0 ? chunk + "}" : index === split.length - 1 ? "{" + chunk : "{" + chunk + "}");
      parsed = parseSingleJSON(jsonChunk, text, msg_info, role);
    });
  } else {
    parsed = parseSingleJSON(chunkValue, text, msg_info, role);
  }
  return parsed;
}

const parseSingleJSON = (jsonString : any, text :any , msg_info: any, role : any) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.content === undefined) {
      text = "Sorry, your request could not be fulfilled. Please try again.";
    } else {
      text += parsed.content;
    }
    msg_info = parsed.msg_info;
    role = parsed.role;
    return parsed;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};

export const updateMessagesAndConversation = (
  isFirst : boolean, 
  homeDispatch: any, 
  updatedConversation: any, 
  text: string, 
  role: any, 
  msg_info : any, 
  parsed: any
  ) => {

  let updatedMessages;

  if (isFirst) {
    isFirst = false;
    homeDispatch({ field: "refreshConversations", value: true });

    updatedMessages = updatedConversation.messages.map((message:any) => ({
      ...message,
      userActionRequired: false,
    }));

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
  } else {
    updatedMessages = updatedConversation.messages.map((message:any, index:any) => {
      if (index === updatedConversation.messages.length - 1) {
        return {
          ...message,
          content: text,
        };
      }
      return message;
    });
    updatedConversation = {
      ...updatedConversation,
      messages: updatedMessages,
    };
  }

  console.log("updatedMessages conversation.tsx end-----", updatedMessages)
  console.log("updatedConversation conversation.tsx end-----", updatedConversation)

  homeDispatch({
    field: "selectedConversation",
    value: updatedConversation,
  });
}
