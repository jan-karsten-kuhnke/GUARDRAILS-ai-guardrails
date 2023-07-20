
export const lightTheme = {
    primaryColor: "#18B4EA",
    bgColor: "white",
    textColor: "#75777A",
    appBarLogo: "/guardrails-logo-no-bg.png",
    appBarTheme: {
      color: "#75777A",
      backgroundColor: "#8EC5FC",
      backgroundImage:
        "linear-gradient(270.35deg, #FFFFFF 73.58%, #D9F5FC 104.58%)",
    },
    drawerTheme: {
      width: 280,
      flexShrink: 0,
      overflow: "scroll",
  
      "& .MuiDrawer-paper": {
        width: 280,
        boxSizing: "border-box",
        backgroundColor: "white !important",
        color: "#75777A",
      },
      "& .MuiSvgIcon-root ": {
        color: "#75777A",
      },
      "& .Mui-selected": {
        backgroundColor: "#b3ebff !important",
      },
      "& .MuiTypography-root": {
        fontSize: "15px",
        fontWeight: "550",
      },
    },
    mainBgColor: "#f1fcff",
    dataGridTheme: {
      bgColor: "white",
      color: "black",
      disabledIconColor: "#BBBBBB",
    },
    escalationChatTheme: {
      userBgColor: "#e6e6e682",
      assistantBgColor: "#f1fcff",
    },
  };