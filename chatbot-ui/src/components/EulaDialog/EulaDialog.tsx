import { FC, useContext, useState } from "react";

import HomeContext from "@/pages/home/home.context";

import { Button } from "@mui/material";

import { AuthService } from "@/services";
import { setEulaStatus } from "@/services";
import { toast } from "react-hot-toast";
import { LoadingButton } from "@mui/lab";

interface Props {
  onClose: () => void;
}

export const EulaDialog: FC<Props> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const {
    state: { theme },
  } = useContext(HomeContext);

  const handleAcceptEula = async () => {
    try {
      setLoading(true);
      let res = await setEulaStatus();
      if (res.data && res.data.success === true) {
        setLoading(false);
        onClose();
        toast.success("You accepted end user license agreement", {
          position: "bottom-center",
        });
      }
    } catch (err) {
      toast.error("Error while accepting EULA", {
        position: "bottom-center",
      });
      setLoading(false);
    }
  };

  // Render the dialog.
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50`}>
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            className={`inline-block max-h-[700px] 
              transform rounded-lg border border-gray-300 
              px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all 
            lg:my-8 lg:max-h-[600px] lg:w-[900px] lg:p-6 lg:align-middle
               sm:my-8 sm:max-h-[600px] sm:w-[600px] sm:p-6 sm:align-middle ${theme.modalDialogTheme} h-screen`}
            role="dialog"
          >
            <div
              className={`text-lg pb-4 font-bold h-[10%] ${theme.textColor}`}
            >
              {"End user license agreement"}
            </div>
            <div
              className={`p-5 rounded h-[80%] overflow-scroll ${theme.chatItemsBorder}`}
            >
              {license}
            </div>
            <div className="mt-3 flex gap-3 flex-end  justify-end items-baseline">
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => AuthService.doLogout()}
              >
                Decline
              </Button>
              <LoadingButton
                size="small"
                color="success"
                onClick={handleAcceptEula}
                loading={loading}
                variant="outlined"
              >
                Accept
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const license = `The Licensor represents and warrants that: (a) it has the right to
enter into these Terms and to license the Licensed Materials and
provide the Support Services (if any) as contemplated by these
Terms; (b) the Support Services (if any) shall be performed with
reasonable care, skill and diligence; (c) the Licensed Materials
and Support Services (if any) shall comply with all applicable
laws, regulatory requirements, mandatory standards and codes of
practice of any competent authority for the time being in force;
(d) it shall not knowingly introduce into any the Software any
computer software routine intended or designed to disable, damage,
erase, disrupt or impair the normal operation of, or provide
unauthorised access to or modification or monitoring of, any
computer system or any software or information stored on any
computer system, including viruses, worms, time bombs, time locks,
drop-dead devices, access codes, security keys, back doors or trap
door devices;
The Licensor represents and warrants that: (a) it has the right to
enter into these Terms and to license the Licensed Materials and
provide the Support Services (if any) as contemplated by these
Terms; (b) the Support Services (if any) shall be performed with
reasonable care, skill and diligence; (c) the Licensed Materials
and Support Services (if any) shall comply with all applicable
laws, regulatory requirements, mandatory standards and codes of
practice of any competent authority for the time being in force;
(d) it shall not knowingly introduce into any the Software any
computer software routine intended or designed to disable, damage,
erase, disrupt or impair the normal operation of, or provide
unauthorised access to or modification or monitoring of, any
computer system or any software or information stored on any
computer system, including viruses, worms, time bombs, time locks,
drop-dead devices, access codes, security keys, back doors or trap
door devices;
The Licensor represents and warrants that: (a) it has the right to
enter into these Terms and to license the Licensed Materials and
provide the Support Services (if any) as contemplated by these
Terms; (b) the Support Services (if any) shall be performed with
reasonable care, skill and diligence; (c) the Licensed Materials
and Support Services (if any) shall comply with all applicable
laws, regulatory requirements, mandatory standards and codes of
practice of any competent authority for the time being in force;
(d) it shall not knowingly introduce into any the Software any
computer software routine intended or designed to disable, damage,
erase, disrupt or impair the normal operation of, or provide
unauthorised access to or modification or monitoring of, any
computer system or any software or information stored on any
computer system, including viruses, worms, time bombs, time locks,
drop-dead devices, access codes, security keys, back doors or trap
door devices;`;
