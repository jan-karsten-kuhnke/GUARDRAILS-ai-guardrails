import { FC, useState, useEffect, useContext } from "react";
import Search from "../Search/Search";
import { searchUsers } from "@/services";
import { Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import HomeContext from "@/pages/home/home.context";
import { set } from "lodash";

interface Props {
  users: [];
}

export const Users: FC<Props> = (users) => {
    const {
        state: {
          theme
        },
      } = useContext(HomeContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
  let debounceTimeout: NodeJS.Timeout | null = null; // A variable to store the timeout

  const handleSearchTerm = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    if(searchTerm.length === 0) {
        setLoading(false);
    }
  };
  console.log("loading",loading)
  console.log("filteredUsers",filteredUsers)
  console.log("searchTerm",searchTerm)
  useEffect(() => {
    // Clear the previous timeout if it exists
    setLoading(true);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new timeout to make the API call after a delay
    debounceTimeout = setTimeout(() => {
      if (searchTerm.length !== 0) {
        searchUsers(searchTerm).then((res) => {
          console.log(res?.data);
          setFilteredUsers(res?.data);
        setLoading(false);

        });
    } 
    else {
        setLoading(false);
        setFilteredUsers([]);
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
        console.log(user)
    }


  return (
    <>
      <Search
        placeholder={"Search..." || ""}
        searchTerm={searchTerm}
        onSearch={handleSearchTerm}
      />
      <Divider sx={{ margin: "10px 0px" }}>Searched users</Divider>
      {(filteredUsers?.length === 0 && !loading)  && <p>No users found</p>}
      {loading && <div
                  className={`h-4 w-4 animate-spin rounded-full border-t-2 ${theme.chatLoadingTheme}`}
                ></div>}
      {filteredUsers?.map((user: any) => (
        <div key={user.id} className=" p-2 mb-1">
          <div className="flex justify-between">
            <div>
              <p className="text-[12.5px]font-bold">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <Button
                variant="contained"
                sx={{
                  backgroundColor:theme.primaryColor,
                  fontSize: "12px",
                  color:"#fff",
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

    </>
  );
};
