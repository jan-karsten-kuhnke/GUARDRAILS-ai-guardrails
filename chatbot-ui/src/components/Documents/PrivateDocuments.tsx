import { ChangeEvent, useState, useContext } from "react";
import { Button } from "@mui/material";
import { CustomDataGrid } from "./CustomDataGrid";
import { Message } from "@/types/chat";
import { IconUpload } from "@tabler/icons-react";
import { uploadDocuments, deleteDocsGridData } from "@/services/DocsService";
import toast from "react-hot-toast";
import HomeContext from "@/pages/home/home.context";
import { handleSend } from "../Chat/Chat";

export const PrivateDocuments = () => {
  const {
    state: { theme, tiles, selectedTile },
    dispatch: homeDispatch,
    handleNewConversation
  } = useContext(HomeContext);

  const [refereshGridData, setRefereshGridData] = useState<boolean>(true);

  const handleDocumentsUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

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
        setRefereshGridData(!refereshGridData);
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
        setRefereshGridData(!refereshGridData);
      });
  };

  const handleDocumentSummarize = (id: any, title:string) => {
    let message: Message = {
      role: "user",
      content: `Summarize ${title}`,
      userActionRequired: false,
      msg_info: null,
    };
    homeDispatch({ field: "isDocumentDialogOpen", value: false })
    homeDispatch({ field: "selectedTile", value: tiles.find((tile) => tile.code === "summarize-brief")})
    handleSend(message, 0, false, "summarize-brief", null, id);
  };

  const handleDocumentExtract = (id: any, title:string) => {
    let message: Message = {
      role: "user",
      content: `Extract key metrics from ${title}`,
      userActionRequired: false,
      msg_info: null,
    };
    homeDispatch({ field: "isDocumentDialogOpen", value: false })
    homeDispatch({ field: "selectedTile", value: tiles.find((tile) => tile.code === "extraction")})
    handleSend(message, 0, false, "extraction", null, id);
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
            onClick={() => handleDocumentSummarize(params.row.id,params.row.title)}
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
            onClick={() => handleDocumentExtract(params.row.id,params.row.title)}
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
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "25px 40px",
          marginBottom: "0px",
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
      <CustomDataGrid
        columns={columns}
        entity={entity}
        initialSort={initialSort}
        refereshGridData={refereshGridData}
      />
    </>
  );
};
