import { ChangeEvent, useState, useContext } from "react";
import { Button, FormControl, MenuItem, Select, Tooltip } from "@mui/material";
import { CustomDataGrid } from "./CustomDataGrid";
import { IconUpload } from "@tabler/icons-react";
import { uploadDocuments, deleteDocsGridData, getDocumentsByCollectionName } from "@/services/DocsService";
import toast from "react-hot-toast";
import HomeContext from "@/pages/home/home.context";
import { executeOnUploadedDocRef } from "../Chat/Chat";
import DropDown from "../DropDown/DropDown";

export const PrivateDocuments = () => {
  const {
    state: { theme, tiles, collections, selectedCollection },
    dispatch: homeDispatch,
    handleNewConversation,
  } = useContext(HomeContext);

  const [refereshGridData, setRefereshGridData] = useState<boolean>(true);

  const handleDocumentsUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedCollection) {
      toast.error("Please select a collection first", {
        position: "bottom-center",
      });
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
    formData.append("collectionName", selectedCollection);
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
        setRefereshGridData((prevRefreshGridState) => !prevRefreshGridState);
        getDocumentsByCollectionName(selectedCollection).then((res) => {
          if (res?.data?.success && res?.data?.data?.length) {
            homeDispatch({ field: "documents", value: res?.data?.data });
          }
          else {
            homeDispatch({ field: "documents", value: [] });
          }
        });
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
        getDocumentsByCollectionName(selectedCollection).then((res) => {
          if (res?.data?.success && res?.data?.data?.length) {
            homeDispatch({ field: "documents", value: res?.data?.data });
          }
          else {
            homeDispatch({ field: "documents", value: [] });
          }
        });
        setRefereshGridData((prevRefreshGridState) => !prevRefreshGridState);
      });
  };

  const handleExecuteOnUploadedDoc = (id: any, documentTitle: string, code: string) => {
    const params: any = tiles.find((tile) => tile.code === code)?.params;
    executeOnUploadedDocRef.current = { id: id, title: `${params?.promptTitle}  ${documentTitle}`, code: code };
    homeDispatch({ field: "isDocumentDialogOpen", value: false });
    homeDispatch({
      field: "selectedTile",
      value: tiles.find((tile) => tile.code === code),
    });
    handleNewConversation();

    //In the next step useRef in chat component will call the handleSend function
  };

  const collectionData = collections.map((collection: any) => ({
    value: collection?.name,
    title: collection?.name
  }));

  const taskData = tiles
    .filter((tile: any) => tile?.params?.executor === "summarize" || tile?.params?.executor === "extraction")
    .map((tile: any) => ({
      value: tile?.code,
      title: tile?.title
    }));

  const columns = [
    { field: "title", headerName: "Title", flex: 5 },
    {
      field: "actions",
      headerName: "Actions",
      width: 280,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <>
          <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
            <DropDown data={taskData}
              value={"None"}
              label={"Select a task"}
              onChange={(code) => {
                handleExecuteOnUploadedDoc(params.row.id, params.row.title, code)
              }} />
          </FormControl>

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

  const handleSelection = (name: any) => {
    homeDispatch({
      field: "selectedCollection",
      value: name,
    });
    getDocumentsByCollectionName(name).then((res) => {
      if (res?.data?.success && res?.data?.data?.length) {
        homeDispatch({ field: "documents", value: res?.data?.data });
      }
      else {
        homeDispatch({ field: "documents", value: [] });
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-5 px-4">
        <span className="font-bold text-base">Select collection:</span>
        <FormControl sx={{ m: 1, minWidth: 180 }} size="small">
          <DropDown data={collectionData}
            value={selectedCollection}
            label={"Select a collection"}
            onChange={(collection) => {
              handleSelection(collection)
            }} />
        </FormControl>

        <Tooltip
          title="Upload documents in the selected collection"
          placement="top"
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
        </Tooltip>
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
