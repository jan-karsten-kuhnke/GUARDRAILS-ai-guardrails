import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { FC, useContext, useState } from "react";
import { AssistantMessage } from "./ChatMessage";
import HomeContext from "@/pages/home/home.context";

export interface TabsProps {
  sources: [];
}

export const SourceTabBar: FC<TabsProps> = ({ sources }) => {
  const [value, setValue] = useState("0");
  const {
    state: { theme },
  } = useContext(HomeContext);
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const style = {
    padding: "1.5em 0px 0px 0px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
  };
  return (
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
                color: theme.tabTheme.color,
                paddingBottom: "12px",
              },
              "& .MuiButtonBase-root.Mui-selected": {
                color: theme.tabTheme.color,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: theme.tabTheme.color,
              },
            }}
          >
            {sources.map((source: any, index: number) => {
              return (
                <Tab
                  label={source.fileName}
                  value={`${index}`}
                  key={index}
                ></Tab>
              );
            })}
          </TabList>
        </Box>
        {sources.map((source: any, index: number) => {
          return (
            <TabPanel value={`${index}`} sx={style} key={index}>
              <AssistantMessage content={source.doc} />
            </TabPanel>
          );
        })}
      </TabContext>
    </Box>
  );
};
