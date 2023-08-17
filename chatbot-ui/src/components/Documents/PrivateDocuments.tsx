import { ChangeEvent, useState, useContext, useEffect } from "react";
import { Button } from "@mui/material";
import { CustomDataGrid } from "./CustomDataGrid";
import { Message } from "@/types/chat";
import { IconPlus, IconUpload } from "@tabler/icons-react";
import { uploadDocuments, deleteDocsGridData, addCollection, getCollections } from "@/services/DocsService";
import toast from "react-hot-toast";
import HomeContext from "@/pages/home/home.context";
import { executeOnUploadedDocRef } from "../Chat/Chat";

import { EXTRACTION_CODE, SUMMARIZATION_CODE } from "@/utils/constants";

export const PrivateDocuments = () => {
  const {
    state: { theme, tiles, collections, selectedCollection },
    dispatch: homeDispatch,
    handleNewConversation,
  } = useContext(HomeContext);

  const [refereshGridData, setRefereshGridData] = useState<boolean>(true);
  const [collectionName, setCollectionName] = useState("");


  const handleDocumentsUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if(!selectedCollection){ 
      toast.error("Please select a collection first",{
        position: "bottom-center",
      })
      return;
    }
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("collectionName", selectedCollection)
    toast
      .promise(
        uploadDocuments(formData), //calling api here
        {
          loading: `Uploading ${files.length} Documents`,
          success: <b>Documents Uploaded</b>,
          error: <b>Error in Uploading Documents</b>,
        },
        {
          position: "bottom-center",
        }
      )
      .then(() => {
        setRefereshGridData(prevRefreshGridState => !prevRefreshGridState);
        event.target.value = "";
      });
  };

  const handleDelete = (id: any) => {
    // Handle delete logic here
    toast
      .promise(
        deleteDocsGridData(id), //calling api here
        {
          loading: `Deleting Document`,
          success: <b>Documents Deleted</b>,
          error: <b>Error in Deleting Documents</b>,
        },
        {
          position: "bottom-center",
        }
      )
      .then(() => {
        setRefereshGridData(prevRefreshGridState => !prevRefreshGridState);
      });
  };

  const handleExecuteOnUploadedDoc = (id: any, title: string, code: string) => {
    executeOnUploadedDocRef.current = { id: id, title: title, code: code };
    homeDispatch({ field: "isDocumentDialogOpen", value: false });
    homeDispatch({
      field: "selectedTile",
      value: tiles.find((tile) => tile.code === code),
    });
    handleNewConversation();

    //In the next step useRef in chat component will call the handleSend function
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 5 },
    {
      field: "actions",
      headerName: "Actions",
      width: 270,
      renderCell: (params: any) => (
        <>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            sx={{
              fontSize: "12px",
              padding: "3px",
              margin: "0px 5px",
              textTransform: "Capitalize",
            }}
            onClick={() =>
              handleExecuteOnUploadedDoc(
                params.row.id,
                params.row.title,
                SUMMARIZATION_CODE
              )
            }
          >
            Summarize
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            sx={{
              fontSize: "12px",
              padding: "3px",
              textTransform: "Capitalize",
              margin: "0px 5px",
            }}
            onClick={() =>
              handleExecuteOnUploadedDoc(
                params.row.id,
                params.row.title,
                EXTRACTION_CODE
              )
            }
          >
            Extract
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            sx={{
              fontSize: "12px",
              padding: "3px",
              textTransform: "Capitalize",
              margin: "0px 5px",
            }}
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const entity = "documents";
  const initialSort = [
    {
      field: "title",
      sort: "asc",
    },
  ];


  const AddCollection = () => {
    if (!collectionName) return;
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
  }


  const handleGetCollections = () => {
    getCollections().then((res) => {
      if (res?.data?.success && res?.data?.data?.length) {
        homeDispatch({ field: "collections", value: res?.data?.data });
        if (!selectedCollection){
          homeDispatch({
            field: "selectedCollection",
            value: res?.data?.data[0]?.name,
          });
        }
      }
    });
  }

  useEffect(() => {
    handleGetCollections();
  }, []);

  const handleSelection = (name: any) => {
    homeDispatch({
      field: "selectedCollection",
      value: name,
    });
  }

  return (
    <>
      <div className="flex items-center justify-around">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            whiteSpace: "nowrap",
            marginBottom: "0px",
          }}
        >
          <label
            className={`flex gap-1 items-center w-55 p-2 rounded-md ${theme.primaryButtonTheme} cursor-pointer`}
          >
            <input
              type="text"
              placeholder="Enter Collection Name"
              onChange={(e) => setCollectionName(e.target.value)}
              value={collectionName}
              className={`m-0 w-full resize-none p-0 mr-2 py-2 pr-8 pl-5 md:py-3 ${theme.chatTextAreaTheme}`}

            />
            {/* <IconPlus /> */}
            <span onClick={AddCollection}>Add Collection</span>
          </label>
        </div>
        <select
          id="collectionlist"
          value={selectedCollection}
          className={`${theme.taskSelectTheme} outline-none text-sm rounded-lg block p-3`}
          onChange={(ev) => handleSelection(ev.target.value)}
        >
          {collections?.length ? collections.map((collection: any, index) => (
            <option value={collection?.name} key={index} className="py-2">{collection?.name}
            </option>
          )) : ""}
        </select>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <label
            className={`flex gap-1 items-center w-55 p-2 rounded-md ${theme.primaryButtonTheme} cursor-pointer`}
          >
            <IconUpload />
            Upload Documents
            <input
              type="file"
              multiple
              accept=".doc, .docx, .pdf , .csv"
              hidden
              onChange={handleDocumentsUpload}
            />
          </label>
        </div>
      </div>
      <CustomDataGrid
        columns={columns}
        entity={entity}
        initialSort={initialSort}
        refereshGridData={refereshGridData}
      />


    </>
  );
};
