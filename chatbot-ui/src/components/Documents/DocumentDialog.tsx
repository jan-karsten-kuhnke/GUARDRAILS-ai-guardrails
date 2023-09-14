import { FC, useContext, useEffect, useState } from "react";

import HomeContext from "@/pages/home/home.context";
import { PrivateDocuments } from "./PrivateDocuments";

import { IconSquareRoundedX } from "@tabler/icons-react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Tooltip } from "@mui/material";
import { getCollections } from "@/services/DocsService";
import Collections from "./Collections";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const DocumentDialog: FC<Props> = ({ open, onClose }) => {
  const {
    state: { theme, selectedCollection },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [tab, setTab] = useState("1");

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  // Render nothing if the dialog is not open.
  if (!open) {
    return <></>;
  }

  // Render the dialog.
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50`}>
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            className={`inline-block max-h-[700px]
              transform overflow-y-auto rounded-lg border border-gray-300 
              px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all 
            lg:my-8 lg:max-h-[600px] lg:w-[900px] lg:p-6 lg:align-middle
               sm:my-8 sm:max-h-[600px] sm:w-[600px] sm:p-6 sm:align-middle ${theme.modalDialogTheme} h-screen`}
            role="dialog"
          >
            <div
              className={`text-lg pb-4 font-bold text-[${theme.textColor}] flex justify-between`}
            >
              <span>{"Manage documents"}</span>
              <Tooltip title="Close" placement="top">
                <IconSquareRoundedX
                  onClick={onClose}
                  className={theme.sidebarActionButtonTheme}
                />
              </Tooltip>
            </div>
            <TabContext value={tab}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleTabChange}
                  // variant="scrollable"
                  // centered={true}
                  sx={{
                    "& .MuiTabPanel-root": {
                      padding: "0px !important",
                    },
                    "& .MuiTab-root": {
                      fontFamily: "'Inter', sans-serif", // Set the font-family
                      fontWeight: 600,
                      color: theme.documentTabTheme.color,
                      textTransform: "Capitalize",
                      paddingTop: "0px",
                    },
                    "& .MuiButtonBase-root.Mui-selected": {
                      color: theme.documentTabTheme.selectedTabColor,
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: theme.documentTabTheme.selectedTabColor,
                    },
                  }}
                >
                  <Tab label="Documents" value="1" />
                  <Tab label="Collections" value="2" />
                </TabList>
              </Box>
              <TabPanel value="1" sx={{ padding: "24px 0px" }}>
                <PrivateDocuments />
              </TabPanel>
              <TabPanel value="2" sx={{ padding: "24px 0px" }}>
                <Collections/>
              </TabPanel>
            </TabContext>
          </div>
        </div>
      </div>
    </div>
  );
};
