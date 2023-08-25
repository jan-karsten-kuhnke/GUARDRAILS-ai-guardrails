import HomeContext from "@/pages/home/home.context";
import { addCollection } from "@/services/DocsService";
import { Divider, List, ListItem, ListItemText } from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { FC, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface CollectionsProps {
  handleGetCollections: () => void;
}

const Collections: FC<CollectionsProps> = ({ handleGetCollections }) => {
  const {
    state: { theme, collections },
  } = useContext(HomeContext);

  const [collectionName, setCollectionName] = useState("");

  const AddCollection = () => {
    if (!collectionName) {
      toast.error("Please enter a collection name", {
        position: "bottom-center",
      });
      return;
    }
    toast
      .promise(
        addCollection(collectionName), //calling api here
        {
          loading: `Adding Collection`,
          success: <b>Collection Added</b>,
          error: <b>Error in Adding Collection</b>,
        },
        {
          position: "bottom-center",
        }
      )
      .then(() => {
        setCollectionName("");
        handleGetCollections();
      });
  };
  return (
    <>
      <div>
        <label
          className={`flex gap-1 items-center w-55 p-2 rounded-md ${theme.primaryButtonTheme}`}
        >
          <input
            type="text"
            placeholder="Enter Collection Name"
            onChange={(e) => setCollectionName(e.target.value)}
            value={collectionName}
            className={`m-0 w-[80%] resize-none p-0 mr-2 py-2 pr-8 pl-5 md:py-3 ${theme.chatTextAreaTheme}`}
          />

          <span
            onClick={AddCollection}
            className="w-[20%] cursor-pointer flex gap-1 items-center justify-center"
          >
            <IconPlus />
            Add Collection
          </span>
        </label>
      </div>
      <Divider sx={{ margin: "10px 0px" }}>All collections</Divider>
      {collections?.map((collection, index) => {
        return (
          <div key={index}>
            <div className="flex justify-start gap-4 text-base m-1">
              <span>{index + 1}.</span>
              <span>{collection.name}</span>
            </div>
            {index != collections.length - 1 && <Divider />}
          </div>
        );
      })}
    </>
  );
};

export default Collections;
