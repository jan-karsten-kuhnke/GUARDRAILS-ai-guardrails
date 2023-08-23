import { FC, useContext, useState, useEffect } from "react";
import { ChangeEvent } from "react";
import { IconUpload } from "@tabler/icons-react";
import { Message } from "@/types/chat";
import HomeContext from "@/pages/home/home.context";
import { getCollections } from "@/services/DocsService";

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
    state: { theme, selectedTile, collections, selectedCollection },
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
      content: selectedTile.code === "summarize-brief" ? `Summarize ${files[0].name}` : `Extract key metrics from ${files[0].name}`,
      userActionRequired: false,
      msg_info: null,
    };
    handleSend(message, 0, false, formData);
  };

  // collection selection 
  const handleGetCollections = () => {
    getCollections().then((res) => {
      if (res?.data?.success && res?.data?.data?.length) {
        homeDispatch({ field: "collections", value: res?.data?.data });
      }
    });
  }

  useEffect(() => {
    handleGetCollections();
  }, []);

  const handleSelection = (name: any) => {
    homeDispatch({ field: "selectedCollection", value: name });
  }

  return (
    <>
      {selectedTile && inputs.map((input, index) => {
        if (input.key === "files" && input.type === "fileInput") {
          return (
            <label
              key={index}
              className={`flex gap-1 items-center w-32 p-2.5 rounded-md ${selectedTile.has_access && theme.secondaryButtonTheme
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
          );
        }
        else if (input.key === "collection" && input.type === "collectionPicker") {
          {/* Collection Dropdown */ }
          return (
            <div key={index}>
              <div className={`text-[${theme.textColor}] pb-2`}>Choose Collection</div>
              <select
                id="collectionlist"
                value={selectedCollection}
                className={`${theme.taskSelectTheme} text-sm rounded-lg block p-3 w-full outline-none`}
                onChange={(ev) => handleSelection(ev.target.value)}
                placeholder="Choose Collection"
              >
                {collections?.length ? collections.map((collection: any, index) => (
                  <option value={collection?.name} key={index} className="py-2">{collection?.name}
                  </option>
                )) : ""}
              </select>
            </div>
          )
        }
      })}
    </>
  );
};
export default AdditionalInputs;
