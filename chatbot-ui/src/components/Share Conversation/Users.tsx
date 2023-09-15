import { FC, useState, useEffect, useContext } from "react";
import Search from "../Search/Search";
import { searchUsers, updateConversationAcl } from "@/services";
import { Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import HomeContext from "@/pages/home/home.context";
import { set } from "lodash";
import toast from "react-hot-toast";

interface Props {}

export const Users: FC<Props> = () => {
  const {
    state: { theme, selectedConversation },
    handleUpdateSelectedConversation,
  } = useContext(HomeContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  let debounceTimeout: NodeJS.Timeout | null = null; // A variable to store the timeout

  const handleSearchTerm = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    if (searchTerm.length === 0) {
      setFilteredUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear the previous timeout if it exists
    setLoading(true);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new timeout to make the API call after a delay
    debounceTimeout = setTimeout(() => {
      if (searchTerm.length === 0) {
        setLoading(false);
        setFilteredUsers([]);
      } else {
        searchUsers(searchTerm).then((res) => {
            setFilteredUsers(
              res?.data?.filter(
                (user: any) =>
                  !selectedConversation?.acl?.uid.includes(user.email)
              )
            );
  
          setLoading(false);
        });
        
      }
    }, 500);

    // Clean up the timeout on component unmount
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [searchTerm]);

  const handleShare = (user: any) => {
    if (!selectedConversation) return;
    const updatedAcl = selectedConversation?.acl;
    updatedAcl.uid.push(user.email);
    updatedAcl.is_provide_access=true
    toast
      .promise(
        updateConversationAcl(selectedConversation?.id, updatedAcl), //calling api here
        {
          loading: `Sharing the conversation with ${user.firstName} ${user.lastName}`,
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
          //remove the user from the filtered list
          setFilteredUsers(filteredUsers.filter(
            (filteredUser: any) => filteredUser.email !== user.email
          ));


        }
      });
  };

  const handleRevoke = (user: any) => {
    if (!selectedConversation) return;
    const updatedAcl = selectedConversation?.acl;
    const index = updatedAcl.uid.indexOf(user);
    if (index > -1) {
      updatedAcl.uid.splice(index, 1);
    }
    updatedAcl.is_provide_access=true

    toast
    .promise(
      updateConversationAcl(selectedConversation?.id, updatedAcl), //calling api here
      {
        loading: `Revoking access to the conversation for ${user}`,
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
        setLoading(true)
        searchUsers(searchTerm).then((res) => {
          setFilteredUsers(
            res?.data?.filter(
              (user: any) =>
                !selectedConversation?.acl?.uid.includes(user.email)
            )
          );

        setLoading(false);
      });

      }
    });
  };
console.log(selectedConversation?.acl)
  return (
    <>
      <Search
        placeholder={"Search users..." || ""}
        searchTerm={searchTerm}
        onSearch={handleSearchTerm}
      />
      <Divider sx={{ margin: "10px 0px" }}>Searched users</Divider>
      {((filteredUsers?.length === 0 && !loading) || searchTerm.length==0 ) && <p>No users found</p>}
      {loading && searchTerm.length!=0 && (
        <div
          className={`h-4 w-4 animate-spin rounded-full border-t-2 ${theme.chatLoadingTheme}`}
        ></div>
      )}
      {searchTerm.length>0 &&  filteredUsers?.map((user: any, index) => (
        <div key={index} className=" p-2 mb-1">
          <div className="flex justify-between">
            <div>
              <p className="text-[12.5px]font-bold">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-[12.5px]font-bold">
                {user.email}
              </p>
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
                onClick={() => handleShare(user)}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Divider sx={{ margin: "10px 0px" }}>Already shared</Divider>
      {selectedConversation?.acl?.uid?.map((user: any, index: number) => (
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
