import {
  IconFileExport,
  IconSettings,
  IconArchive,
  IconArchiveOff,
  IconLogout,
  IconFileDescription,
} from "@tabler/icons-react";
import { useContext, useState } from "react";
import HomeContext from "@/pages/home/home.context";

import { SettingDialog } from "@/components/Settings/SettingDialog";
import { DocumentDialog } from "@/components/Documents/DocumentDialog";

import { SidebarButton } from "../../Sidebar/SidebarButton";
import ChatbarContext from "../Chatbar.context";
import { ClearConversations } from "./ClearConversations";
import { AuthContext } from "@/services/AuthService";

export const ChatbarFooter = () => {
  const authContext = useContext(AuthContext);

  const {
    state: {
      theme,
      conversations,
      isArchiveView,
      isDocumentDialogOpen,
      isSettingDialogOpen
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const { handleClearConversations, handleExportData } =
    useContext(ChatbarContext);

  const handleIsArchiveView = () => {
    homeDispatch({ field: "isArchiveView", value: !isArchiveView });
  };

  return (
    <div className={`flex flex-col items-center space-y-1 ${theme.dividerTopTheme} pt-1 text-sm`}>
      {conversations.length > 0 && !isArchiveView ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}
      {/* <Import onImport={handleImportConversations} /> */}

      {/* <SidebarButton
        text={('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      /> */}

      {isArchiveView ? (
        <SidebarButton
          text={"Active Chats"}
          icon={<IconArchiveOff size={18} />}
          onClick={() => handleIsArchiveView()}
        />
      ) : (
        <SidebarButton
          text={"Archived Chats"}
          icon={<IconArchive size={18} />}
          onClick={() => handleIsArchiveView()}
        />
      )}

      <SidebarButton
        text={"Documents"}
        icon={<IconFileDescription size={18} />}
        onClick={() => homeDispatch({ field: "isDocumentDialogOpen", value: true })}
      />

      <SidebarButton
        text={"Settings"}
        icon={<IconSettings size={18} />}
        onClick={() => homeDispatch({ field: "isSettingDialogOpen", value: true })}
      />
      <SidebarButton
        text={"Log Out"}
        icon={<IconLogout size={18} />}
        onClick={() => authContext.logout()}
      />



      <DocumentDialog
        open={isDocumentDialogOpen}
        onClose={() => {
          homeDispatch({ field: "isDocumentDialogOpen", value: false });
        }}
      />
      <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          homeDispatch({ field: "isSettingDialogOpen", value: false });
        }}
      />
    </div>
  );
};
