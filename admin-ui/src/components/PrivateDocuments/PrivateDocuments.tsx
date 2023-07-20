import { ChangeEvent, useState } from "react";
import { Button } from "@mui/material";
import { CustomDataGrid } from "../DataGrids/CustomDataGrid";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import { uploadDocuments } from "@/services";
import toast from "react-hot-toast";
import { styles } from "@/styles";

export const PrivateDocuments = () => {
  const [ refereshGridData, setRefereshGridData ] = useState<boolean>(true)

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

    toast.promise(
      uploadDocuments(formData), //calling api here
      {
        loading: `Uploading ${files.length} Documents`,
        success: <b>Documents Uploaded</b>,
        error: <b>Error in Uploading Documents</b>,
      },
      {
        position: "bottom-center",
      })
      .then(()=>{
        setRefereshGridData(!refereshGridData);
        event.target.value = "";
      })
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 5 },
    { field: "description", headerName: "Description", flex: 5 },
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
        <label className={`flex gap-1 items-center w-55 p-2 rounded-md cursor-pointer bg-[${styles.primaryColor}] text-[#ffffff] opacity-80 hover:opacity-100`}>
          <UploadOutlinedIcon />
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
