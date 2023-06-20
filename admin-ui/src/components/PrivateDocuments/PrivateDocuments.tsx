import React, { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@mui/material";
import { CustomDataGrid } from "../DataGrids/CustomDataGrid";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import { uploadDocuments } from "@/services";
import { PopupNotify, AlertType } from "../PopupNotify/PopupNotify";

export const PrivateDocuments = () => {
  const [alert, setAlert] = useState<AlertType>({
    open: false,
    message: "",
    severity: "success",
    autoHideDuration: 3000
  });

  const handleDocumentsUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setAlert({
      open: true,
      message: `Uploading ${files.length} Documents`,
      severity: "info",
      autoHideDuration:3000
    });

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try{
      let { data } = await uploadDocuments(formData);
      setAlert({
        open: true,
        message: "Documents Uploaded",
        severity: "success",
        autoHideDuration: 3000
      });  
    }
    catch(error:any){
      console.log(error?.message)
      setAlert({
        open: true,
        message: error?.message,
        severity: "error",
        autoHideDuration: 3000
      });

    }
    event.target.value=""
  };

  const handleAlertClose = () => {
    setAlert((prev) => {
      return { ...prev, open: false };
    });
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
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadOutlinedIcon />}
        >
          Upload Documents
          <input
            type="file"
            multiple
            accept=".doc, .docx, .pdf"
            hidden
            onChange={handleDocumentsUpload}
          />
        </Button>
      </div>
      <CustomDataGrid
        columns={columns}
        entity={entity}
        initialSort={initialSort}
      />
      {alert.open && <PopupNotify {...alert} onClose={handleAlertClose}/>}
    </>
  );
};
