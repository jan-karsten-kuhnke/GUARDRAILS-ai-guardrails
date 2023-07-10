import { FC, useState, useContext } from "react";
import { ChangeEvent } from "react";
import { IconUpload } from "@tabler/icons-react";
// import { uploadDocuments, deleteDocsGridData } from "@/services/DocsService";
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
              <label className="flex gap-1 items-center w-32 p-2.5 rounded-md bg-[black] hover:bg-[#595959]  dark:bg-[#202123] dark:hover:bg-[#3e3f40] cursor-pointer">
                <IconUpload />
                Upload File
                <input
                  type="file"
                  // multiple
                  accept=".doc, .docx, .pdf , .csv"
                  hidden
                  onChange={handleDocumentsUpload}
                />
              </label>
            </>
          );
        }
      })}
    </>
  );
};
export default AdditionalInputs;
