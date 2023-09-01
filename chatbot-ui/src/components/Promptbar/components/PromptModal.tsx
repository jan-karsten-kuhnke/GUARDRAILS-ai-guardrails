import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";

import { Prompt } from "@/types/prompt";
import HomeContext from "@/pages/home/home.context";
import { useContext } from "react";
import { Tooltip } from "@mui/material";
import { IconSquareRoundedX } from "@tabler/icons-react";

interface Props {
  prompt: Prompt;
  onClose: () => void;
  onUpdatePrompt: (prompt: Prompt) => void;
}

export const PromptModal: FC<Props> = ({ prompt, onClose, onUpdatePrompt }) => {
  const {
    state: { theme },
  } = useContext(HomeContext);

  const [name, setName] = useState(prompt.name);
  const [description, setDescription] = useState(prompt.description);
  const [content, setContent] = useState(prompt.content);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      onUpdatePrompt({ ...prompt, name, description, content: content.trim() });
      onClose();
    }
  };

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50"
      onKeyDown={handleEnter}
    >
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className={`${theme.modalDialogTheme} inline-block max-h-[400px] transform overflow-y-auto rounded-lg  px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all  sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle`}
            role="dialog"
          >
            <div className={`flex justify-end`}>
              <Tooltip title="Close" placement="top">
                <IconSquareRoundedX
                  onClick={onClose}
                  className={theme.sidebarActionButtonTheme}
                />
              </Tooltip>
            </div>
            <div className={`text-[${theme.textColor}] text-sm font-bold`}>
              {"Name"}
            </div>
            <input
              ref={nameInputRef}
              className={`${theme.chatTextAreaTheme} mt-2 w-full rounded-lg  px-4 py-2 text-[${theme.textColor}`}
              placeholder={"A name for your prompt." || ""}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className={`text-[${theme.textColor}] mt-6 text-sm font-bold`}>
              {"Description"}
            </div>
            <textarea
              className={`${theme.chatTextAreaTheme} mt-2 w-full rounded-lg  px-4 py-2 text-[${theme.textColor}`}
              style={{ resize: "none" }}
              placeholder={"A description for your prompt." || ""}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <div
              className={`text-[${theme.textColor}] mt-6 text-sm font-bold `}
            >
              {"Prompt"}
            </div>
            <textarea
              className={`${theme.chatTextAreaTheme} mt-2 w-full rounded-lg  px-4 py-2 text-[${theme.textColor}`}
              style={{ resize: "none" }}
              placeholder={
                "Prompt content. Use {{}} to denote a variable. Ex: {{name}} is a {{adjective}} {{noun}}"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />

            <button
              type="button"
              className={`w-full px-4 py-2 mt-6 border rounded-lg ${theme.primaryButtonTheme}`}
              onClick={() => {
                const updatedPrompt = {
                  ...prompt,
                  name,
                  description,
                  content: content.trim(),
                };

                onUpdatePrompt(updatedPrompt);
                onClose();
              }}
            >
              {"Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
