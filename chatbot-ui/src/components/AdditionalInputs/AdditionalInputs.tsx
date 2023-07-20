import { FC, useContext } from "react";
import { ChangeEvent } from "react";
import { IconUpload } from "@tabler/icons-react";
import { Message } from "@/types/chat";
import HomeContext from "@/pages/home/home.context";

interface Props {
  inputs: [{
    key : string,type:string
  }];
  handleSend: Function;
}

const AdditionalInputs: FC<Props> = ({ inputs, handleSend }) => {
  const {
    state: { theme },
  } = useContext(HomeContext);

  const handleDocumentUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const formData = new FormData(); 
    formData.append("files", files[0]);
    
    let message: Message = {
      role: "user",
      content: `Summarize ${files[0].name}`,
      userActionRequired: false,
      msg_info: null
    }
    handleSend(message,0,false,formData);
  };

  return (
    <>
      {inputs.map((input, index) => {
        if (input.key === "files" && input.type === "fileInput") {
          return (
              <label  key={index} className={`flex gap-1 items-center w-32 p-2.5 rounded-md ${theme.secondaryButtonTheme} cursor-pointer`}>
                <IconUpload />
                Upload File
                <input
                  type="file"
                  accept=".pdf "
                  hidden
                  onChange={handleDocumentUpload}
                />
              </label>

          );
        }
      })}
    </>
  );
};
export default AdditionalInputs;
