import { FC, useState, useEffect, useContext } from "react";
import Search from "../Search/Search";
import { updateConversationAcl, userGroups } from "@/services";
import { Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import HomeContext from "@/pages/home/home.context";
import { set } from "lodash";
import toast from "react-hot-toast";

interface Props {}

export const Groups: FC<Props> = ({}) => {
  const {
    state: { theme, selectedConversation },
    handleUpdateSelectedConversation,
  } = useContext(HomeContext);

  const [allGroups, setAllGroups] = useState([]);

  useEffect(() => {
    userGroups().then((res) => {
      setAllGroups(res?.data?.filter(
        (group: any) =>
          !selectedConversation?.acl?.gid.includes(group)
      ))
    });
  }, []);


  const handleShare = (group: any) => {
    if (!selectedConversation) return;
    const updatedAcl = selectedConversation?.acl;
    updatedAcl.gid.push(group);
    toast
      .promise(
        updateConversationAcl(selectedConversation?.id, updatedAcl), //calling api here
        {
          loading: `Sharing the conversation with ${group} group`,
          success: <b>Succefully shared the conversation</b>,
          error: <b>Error in sharing the conversation</b>,
        },
        {
          position: "bottom-center",
        }
      )
      .then((res: any) => {
        if (res?.data?.success) {
          handleUpdateSelectedConversation({ key: "acl", value: updatedAcl });
       
          setAllGroups(
            allGroups.filter(
              (filteredGroup: any) => filteredGroup !== group
            )
          );
        }
      });
  };

  const handleUnshare = (group: any) => {
    if (!selectedConversation) return;
    const updatedAcl = selectedConversation?.acl;
    const index = updatedAcl.gid.indexOf(group);
    if (index > -1) {
      updatedAcl.gid.splice(index, 1);
    }
    toast
    .promise(
      updateConversationAcl(selectedConversation?.id, updatedAcl), //calling api here
      {
        loading: `Unsharing the conversation with ${group} group`,
        success: <b>Succefully unshared the conversation</b>,
        error: <b>Error in unsharing the conversation</b>,
      },
      {
        position: "bottom-center",
      }
    )
    .then((res: any) => {
      if (res?.data?.success) {
        handleUpdateSelectedConversation({ key: "acl", value: updatedAcl });
        setAllGroups([...allGroups, group] as never[]);
      }
    });
  };

  return (
    <>
      <Divider sx={{ margin: "10px 0px" }}>All groups</Divider>

      {allGroups?.map((group: any, index) => (
        <div key={index} className=" p-2 mb-1">
          <div className="flex justify-between">
            <div>
              <p className="text-[12.5px]font-bold">{group}</p>
            </div>
            <div>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: theme.primaryColor,
                  fontSize: "12px",
                  color: "#fff",
                  padding: "5px",
                  textTransform: "Capitalize",
                  margin: "0px 5px",
                }}
                onClick={() => handleShare(group)}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Divider sx={{ margin: "10px 0px" }}>Already shared</Divider>
      {selectedConversation?.acl?.gid?.map((user: any, index: number) => (
        <div key={index} className=" p-2 mb-1">
          <div className="flex justify-between">
            <div>
              <p className="text-[12.5px]font-bold">{user}</p>
            </div>
            <div>
              <Button
                variant="outlined"
                color="error"
                sx={{
                  fontSize: "12px",
                  padding: "5px",
                  textTransform: "Capitalize",
                  margin: "0px 5px",
                }}
                onClick={() => handleUnshare(user)}
              >
                Revoke
              </Button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
