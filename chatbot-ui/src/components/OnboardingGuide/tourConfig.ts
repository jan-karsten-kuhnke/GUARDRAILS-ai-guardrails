interface TourStep {
  selector: string;
  content: string;
}

const applicationName: string = import.meta.env.VITE_APPLICATION_NAME;;

export const tourConfig: TourStep[] = [
  {
    selector: "",
    content:
      `Welcome to ${applicationName}, Here is the basic tour to start your journey`,
  },
  {
    selector: "#new-chat",
    content: "You can start new conversation from here",
  },
  {
    selector: "#tiles-container",
    content:
      "These are the tiles to perform various tasks. You can select one of them to perform a particular task",
  },
  {
    selector: "#chat-input",
    content: "Write your prompt here according to the selected task",
  },
  {
    selector: "#send-button",
    content: "Enter or Click here to send prompt",
  },
  {
    selector: "#new-chat-folder",
    content:
      "You can create new folder from here to organize your conversation",
  },
  {
    selector: "#conversation-container",
    content:
      "Here you will find all the conversations, you can drag and drop conversations to move inside the folder",
  },
  {
    selector: "#new-prompt",
    content: "You can create a new prompt from here",
  },
  {
    selector: "#new-prompt-folder",
    content: "You can create new prompt from here to organize your prompts",
  },
  {
    selector: "#prompt-container",
    content:
      "Here you will find all the prompts, you can drag and drop prompts to move inside the folder",
  },
];
