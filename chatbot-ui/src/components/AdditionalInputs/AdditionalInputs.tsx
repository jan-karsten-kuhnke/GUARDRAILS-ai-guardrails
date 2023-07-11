import { FC, useState, useContext } from "react";
import { ChangeEvent } from "react";
import { IconUpload } from "@tabler/icons-react";

import toast from "react-hot-toast";
import { summarizeBrief } from "@/services";

interface Props {
  inputs: string[];
  handleSend: Function;
}

const AdditionalInputs: FC<Props> = ({ inputs, handleSend }) => {
  const handleDocumentUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const formData = new FormData();
    
    formData.append("files", files[0]);

    // handleSend(formData);
    

    toast
      .promise(
        summarizeBrief(formData), //calling api here
        {
          loading: `Uploading ${files.length} File`,
          success: <b>File Uploaded</b>,
          error: <b>Error in Uploading Documents</b>,
        },
        {
          position: "bottom-center",
        }
      )
      .then((data) => {
        // setRefereshGridData(!refereshGridData);
        console.log(data.data);
        event.target.value = "";
      });
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
                 key={index}
                  type="file"
                  accept=".pdf "
                  hidden
                  onChange={handleDocumentUpload}
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
