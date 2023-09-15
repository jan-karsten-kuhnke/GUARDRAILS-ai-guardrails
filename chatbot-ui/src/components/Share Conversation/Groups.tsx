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
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
    userGroups().then((res) => {
      setAllGroups(res?.data?.filter(
        (group: any) =>
          !selectedConversation?.acl?.gid.includes(group)
      ))
      setLoading(false);

    });
  }, []);


  const handleShare = (group: any) => {
    if (!selectedConversation) return;
    const updatedAcl = selectedConversation?.acl;
    updatedAcl.gid.push(group);
    updatedAcl.is_provide_access=false
    let payload={
      gid:[group],
      is_provide_access:true
    }
    toast
      .promise(
        updateConversationAcl(selectedConversation?.id, payload), //calling api here
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

  const handleRevoke = (group: any) => {
    if (!selectedConversation) return;
    const updatedAcl = selectedConversation?.acl;
    const index = updatedAcl.gid.indexOf(group);
    if (index > -1) {
      updatedAcl.gid.splice(index, 1);
    }
    updatedAcl.is_provide_access=true
    let payload={
      gid:[group],
      is_provide_access:false
    }
    toast
    .promise(
      updateConversationAcl(selectedConversation?.id, payload), //calling api here
      {
        loading: `Revoking access to the conversation for ${group} group`,
        success: <b>Succefully revoked access to the conversation</b>,
        error: <b>Error in revoking access to the conversation</b>,
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

      {loading && (
        <div
          className={`h-4 w-4 animate-spin rounded-full border-t-2 ${theme.chatLoadingTheme}`}
        ></div>
      )}
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
                  backgroundColor: theme.shareButtonColor,
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
                onClick={() => handleRevoke(user)}
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
