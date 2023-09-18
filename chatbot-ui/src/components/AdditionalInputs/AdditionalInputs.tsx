import { FC, useContext, useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { IconSend, IconUpload } from "@tabler/icons-react";
import { Message } from "@/types/chat";
import HomeContext from "@/pages/home/home.context";
import { getDocumentsByCollectionName } from "@/services/DocsService";
import DropDown from "../DropDown/DropDown";
import { Button, FormControl } from "@mui/material";
import { checkInput } from "@/utils/app/conversation";
import { COLLECTION_PICKER, DOCUMENT_PICKER } from "@/utils/constants";
import toast from "react-hot-toast";

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
      documents,
      selectedConversation,
    },
    handleUpdateSelectedConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [inputUrl, setInputUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsValidUrl(false);
    const url = event.target.value;
    setInputUrl(url);
    // Regular expression to validate a URL
    const urlRegex = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );
    if (urlRegex.test(url)) {
      setIsValidUrl(true);
      handleUpdateSelectedConversation({
        key: "task_params",
        value: {
          ...selectedConversation?.task_params,
          ...(url ? { url: url } : {}),
        },
      });
    }
  };

  const handleUrlSend = () => {
    
    let message: Message = {
      role: "user",
      content: selectedTile?.params?.prompt,
      userActionRequired: false,
      msg_info: null,
    };
    handleSend(message, 0);
    setInputUrl("");
  }

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

  const handleGetDocuments = () => {
    const collectionName = selectedConversation?.task_params?.collectionName;
    if (!collectionName) return;
    getDocumentsByCollectionName(collectionName).then((res) => {
      if (res?.data?.success && res?.data?.data?.length) {
        homeDispatch({ field: "documents", value: res?.data?.data });
      } else {
        homeDispatch({ field: "documents", value: [] });
      }
    });
  };

  const handleCollectionSelect = (collection: any) => {
    let isDocumentPicker = checkInput(inputs, DOCUMENT_PICKER);
    handleUpdateSelectedConversation({
      key: "task_params",
      value: {
        ...selectedConversation?.task_params,
        collectionName: collection,
        ...(isDocumentPicker ? { document: undefined } : {}),
      },
    });
  };

  const handleDocumentSelect = (id: any) => {
    if (id == undefined) {
      handleUpdateSelectedConversation({
        key: "task_params",
        value: { ...selectedConversation?.task_params, document: undefined },
      });
      return;
    }
    const documentSelected = documents.find(
      (document: any) => document.id === id
    );
    if (documentSelected) {
      handleUpdateSelectedConversation({
        key: "task_params",
        value: {
          ...selectedConversation?.task_params,
          document: documentSelected,
        },
      });
    }
  };

  useEffect(() => {
    if (!checkInput(inputs, DOCUMENT_PICKER)) return;
    handleGetDocuments();
  }, [selectedConversation?.task_params?.collectionName, selectedTile]);

  const collectionData =
    collections?.map((collection: any) => ({
      value: collection?.name,
      title: collection?.name,
    })) || [];

  const documentData =
    documents?.map((document: any) => ({
      value: document?.id,
      title: document?.title,
    })) || [];

  return (
    <>
      <div className="flex flex-wrap ">
        {selectedTile &&
          inputs.map((input, index) => {
            if (input.key === "files" && input.type === "fileInput") {
              return (
                <div
                  className="w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 p-2"
                  key={index}
                >
                  <div className={`text-[${theme.textColor}] pb-2`}>
                    Choose file
                  </div>
                  <label
                    className={`flex gap-1 items-center  p-[7px] rounded-md ${
                      selectedTile.has_access && theme.secondaryButtonTheme
                    } 
            ${
              selectedTile.has_access
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
                <div
                  className="w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 p-2 "
                  key={index}
                >
                  <div className={`text-[${theme.textColor}] pb-2`}>
                    Choose Collection
                  </div>
                  <FormControl
                    sx={{ minWidth: 120, width: "100%" }}
                    size="small"
                  >
                    <DropDown
                      data={collectionData}
                      value={
                        selectedConversation?.task_params?.collectionName
                          ? selectedConversation?.task_params?.collectionName
                          : "None"
                      }
                      label={"Select Collection"}
                      onChange={(collection) => {
                        handleCollectionSelect(collection);
                      }}
                    />
                  </FormControl>
                </div>
              );
            } else if (
              input.key === "document" &&
              input.type === "documentPicker"
            ) {
              return (
                <div
                  key={index}
                  className="w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 p-2 "
                >
                  <div className={`text-[${theme.textColor}] pb-2`}>
                    Choose Document
                  </div>
                  <FormControl
                    sx={{ minWidth: 120, width: "100%" }}
                    size="small"
                  >
                    <DropDown
                      data={documentData}
                      value={
                        selectedConversation?.task_params?.document
                          ? selectedConversation?.task_params?.document?.id
                          : "None"
                      }
                      label={"All"}
                      defaultSelectable={true}
                      onChange={(document) => {
                        handleDocumentSelect(
                          document === "None" ? undefined : document
                        );
                      }}
                    />
                  </FormControl>
                </div>
              );
            } else if (input.key === "url" && input.type === "url") {
              return (
                <div
                  key={index}
                  className="w-full md:w-full lg:w-full xl:w-full p-2"
                >
                  <div className={`text-[${theme.textColor}] pb-2`}>
                    Insert URL
                  </div>
                  <div className="w-full">

                    <input
                      className={`${
                        isValidUrl
                          ? theme.searchBoxTheme
                          : theme.errorInputTheme
                      } w-1/2 flex-1 rounded-md border  px-4 py-2.5 pr-10 text-[14px] leading-3 `}
                      type="text"
                      placeholder="Enter a URL"
                      value={inputUrl}
                      onChange={handleUrlChange}
                    />
                  
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: theme.primaryColor,
                      fontSize: "12px",
                      color: "#fff",
                      padding: "9px",
                      textTransform: "Capitalize",
                      margin: "10px",
                    }}
                    onClick={() => (isValidUrl && inputUrl.length) ? handleUrlSend() : toast.error("Invalid URL")}
                    >
                    Send
                    <IconSend size={18} />
                  </Button>
                  </div>
                </div>
              );
            }
          })}
      </div>
    </>
  );
};
export default AdditionalInputs;
