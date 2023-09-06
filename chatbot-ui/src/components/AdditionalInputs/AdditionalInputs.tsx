import { FC, useContext, useState, useEffect } from "react";
import { ChangeEvent } from "react";
import { IconUpload } from "@tabler/icons-react";
import { Message } from "@/types/chat";
import HomeContext from "@/pages/home/home.context";
import {
  getCollections,
  getDocumentsByCollectionName,
} from "@/services/DocsService";
import DropDown from "../DropDown/DropDown";
import { FormControl } from "@mui/material";

interface Props {
  inputs: [
    {
      key: string;
      type: string;
    }
  ];
  handleSend: Function;
}

const AdditionalInputs: FC<Props> = ({ inputs, handleSend }) => {
  const {
    state: {
      theme,
      selectedTile,
      collections,
      selectedCollection,
      documents,
      selectedDocument,
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const handleDocumentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const formData = new FormData();
    formData.append("files", files[0]);

    let message: Message = {
      role: "user",
      content: `${selectedTile?.params?.prompt} ${files[0].name}`,
      userActionRequired: false,
      msg_info: null,
    };
    handleSend(message, 0, formData);
  };

  const collectionData = collections?.map((collection: any) => ({
    value: collection?.name,
    title: collection?.name
  })) || [];

  const documentData = documents?.map((document: any) => ({
    value: document?.id,
    title: document?.title
  })) || [];

  // collection selection
  const handleGetCollections = () => {
    getCollections().then((res) => {
      if (res?.data?.success && res?.data?.data?.length) {
        homeDispatch({ field: "collections", value: res?.data?.data });
        getDocumentsByCollectionName(res?.data?.data[0]?.name).then((res) => {
          if (res?.data?.success && res?.data?.data?.length) {
            homeDispatch({ field: "documents", value: res?.data?.data });
          } else {
            homeDispatch({ field: "documents", value: [] });
          }
        });
      }
    });
  };

  useEffect(() => {
    handleGetCollections();
  }, []);

  const handleCollectionSelect = (name: any) => {
    homeDispatch({ field: "selectedCollection", value: name });
    getDocumentsByCollectionName(name).then((res) => {
      if (res?.data?.success && res?.data?.data?.length) {
        homeDispatch({ field: "documents", value: res?.data?.data });
      } else {
        homeDispatch({ field: "documents", value: [] });
      }
    });
  };
  const handleDocumentSelect = (id: any) => {
    if (id == "All") {
      homeDispatch({ field: "selectedDocument", value: undefined });
      return;
    }
    homeDispatch({ field: "selectedDocument", value: id });
  };

  return (
    <>
      <div className="flex justify-between items-center">
        {selectedTile &&
          inputs.map((input, index) => {
            if (input.key === "files" && input.type === "fileInput") {
              return (
                <div className="w-1/2 mr-2" key={index}>
                  <div className={`text-[${theme.textColor}] pb-2`}>
                    Choose file
                  </div>
                  <label
                    className={`flex gap-1 items-center  p-[7px] rounded-md ${selectedTile.has_access && theme.secondaryButtonTheme
                      } 
            ${selectedTile.has_access
                        ? "cursor-pointer"
                        : "cursor-not-allowed text-gray-400"
                      }`}
                  >
                    <IconUpload />
                    Upload File
                    {selectedTile.has_access ? (
                      <input
                        type="file"
                        accept=".pdf "
                        hidden
                        onChange={handleDocumentUpload}
                      />
                    ) : (
                      ""
                    )}
                  </label>
                </div>
              );
            } else if (
              input.key === "collection" &&
              input.type === "collectionPicker"
            ) {
              {
                /* Collection Dropdown */
              }
              return (
                <div className="w-1/2 mr-2" key={index}>
                  <div className={`text-[${theme.textColor}] pb-2`}>
                    Choose Collection
                  </div>
                  <FormControl sx={{ minWidth: 120, width: "100%" }} size="small">
                    <DropDown data={collectionData}
                      value={selectedCollection}
                      label={"Select Collection"}
                      onChange={(collection) => {
                        handleCollectionSelect(collection)
                      }} />
                  </FormControl>
                </div>

              );
            } else if (
              input.key === "document" &&
              input.type === "documentPicker"
            ) {
              return (
                <div key={index} className="w-1/2">
                  <div className={`text-[${theme.textColor}] pb-2`}>
                    Choose Document
                  </div>
                  <FormControl sx={{ minWidth: 120, width: "100%" }} size="small">
                    <DropDown data={documentData}
                      value={selectedDocument ? selectedDocument : "None"}
                      label={"All"}
                      defaultSelectable={true}
                      onChange={(document) => {
                        handleDocumentSelect(document === "None" ? undefined : document)
                      }} />
                  </FormControl>
                </div>
              );
            }
          })}
      </div>
    </>
  );
};
export default AdditionalInputs;
