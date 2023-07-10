import { FC, useState, useContext } from "react";
import { ChangeEvent } from "react";
import { Button } from "@mui/material";
import { IconUpload } from "@tabler/icons-react";
import { uploadDocuments, deleteDocsGridData } from "@/services/DocsService";
import toast from "react-hot-toast";

interface Props {
  inputs: string[];
}

const AdditionalInputs: FC<Props> = ({ inputs }) => {
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

    // console.log("formData", formData);
    // console.log("files", event.target.files);

    // toast
    //   .promise(
    //     uploadDocuments(formData), //calling api here
    //     {
    //       loading: `Uploading ${files.length} Documents`,
    //       success: <b>Documents Uploaded</b>,
    //       error: <b>Error in Uploading Documents</b>,
    //     },
    //     {
    //       position: "bottom-center",
    //     }
    //   )
    //   .then(() => {
    //     // setRefereshGridData(!refereshGridData);
    //     event.target.value = "";
    //   });
  };

  return (
    <>
      {inputs.map((input, index) => {
        if (input == "fileUpload") {
          return (
            <>
              <Button
                variant="contained"
                component="label"
                startIcon={<IconUpload />}
                sx={{
                  backgroundColor: "#202123",
                  "&.MuiButton-root:hover": {
                    backgroundColor: "#4b4b4b",
                  },
                }}
              >
                Upload File
                <input
                  type="file"
                  // multiple
                  accept=".doc, .docx, .pdf , .csv"
                  hidden
                  onChange={handleDocumentsUpload}
                />
              </Button>
            </>
          );
        }
      })}
    </>
  );
};
export default AdditionalInputs;
