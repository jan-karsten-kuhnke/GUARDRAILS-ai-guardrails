import * as React from 'react';
import { Snackbar } from "@mui/material";
import MuiAlert, { AlertProps, AlertColor } from '@mui/material/Alert';

export interface AlertType {
  open: boolean;
  message: string;
  severity: AlertColor | undefined;
  autoHideDuration : number | null
}

export interface PopupNotifyProps extends AlertType {
  onClose: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const PopupNotify = (props: PopupNotifyProps) => {
  const { open, message, severity, autoHideDuration, onClose } = props;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
