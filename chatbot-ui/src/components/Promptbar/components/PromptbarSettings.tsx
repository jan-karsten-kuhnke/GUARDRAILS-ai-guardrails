import { FC, useContext, ChangeEvent } from "react";
import HomeContext from "@/pages/home/home.context";

import PublicPrivateSwitch from "@/components/PublicPrivateSwitch";

interface Props {}

export const PromptbarSettings: FC<Props> = () => {
  const {
    state: { selectedConversation, theme },
  } = useContext(HomeContext);



  return (
    <>
      {selectedConversation?.messages.length != 0 ? (
        <div className={`pt-1 ${theme.dividerTopTheme}`}>
          {/* Disable PublicPrivateSwitch component
              Note:Don't uncomment the below commented code
          */}
          {/* <PublicPrivateSwitch size={25} /> */}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
