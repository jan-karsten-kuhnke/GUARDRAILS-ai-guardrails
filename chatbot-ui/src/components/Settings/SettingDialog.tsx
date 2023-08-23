import { FC, useContext, useEffect, useReducer, useRef } from "react";

import { useCreateReducer } from "@/hooks/useCreateReducer";

import { getSettings, saveSettings } from "@/utils/app/settings";

import { Settings } from "@/types/settings";

import HomeContext from "@/pages/home/home.context";
import { Tooltip } from "@mui/material";
import { IconSquareRoundedX } from "@tabler/icons-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SettingDialog: FC<Props> = ({ open, onClose }) => {
  const settings: Settings = getSettings();
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const {
    state: { showOnboardingGuide, theme },
    handleNewConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    // homeDispatch({ field: 'lightMode', value: state.theme });
    saveSettings(state);
  };

  const hanldeShowOnboardingGuide = () => {
    onClose();
    handleNewConversation();
    homeDispatch({ field: "showOnboardingGuide", value: true });
  };

  // Render nothing if the dialog is not open.
  if (!open) {
    return <></>;
  }

  // Render the dialog.
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className={`${theme.modalDialogTheme} inline-block max-h-[400px] transform overflow-y-auto rounded-lg px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle`}
            role="dialog"
          >
            <div
              className={`text-lg pb-4 font-bold text-[${theme.textColor}] flex justify-between`}
            >
              <span>{"Settings"}</span>
              <Tooltip title="Close" placement="top">
                <IconSquareRoundedX
                  onClick={onClose}
                  className={theme.sidebarActionButtonTheme}
                />
              </Tooltip>
            </div>
            <button
              className={`${theme.primaryButtonTheme} p-2 rounded-md text-sm transition-colors duration-200`}
              onClick={hanldeShowOnboardingGuide}
            >
              Show App Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
