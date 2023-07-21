import { ChangeEvent, useState, useContext } from "react";
import { Button } from "@mui/material";
import { CustomDataGrid } from "@/components/DataGrids/CustomDataGrid";
import { accessRequests } from "@/services/HttpService/";

import toast from "react-hot-toast";

export const AccessRequests = () => {
  const [refereshGridData, setRefereshGridData] = useState<boolean>(true);

  function handleApprove(id: any) {
    toast
      .promise(
        accessRequests(id, true), //calling api here
        {
          loading: `Approving Request`,
          success: <b>Request Approved</b>,
          error: <b>Error in Approving Request</b>,
        },
        {
          position: "bottom-center",
        }
      )
      .then(() => {
        setRefereshGridData(!refereshGridData);
      });
    console.log("Approve", id);
  }

  function handleDecline(id: any) {
    toast
      .promise(
        accessRequests(id, false), //calling api here
        {
          loading: `Declining Request`,
          success: <b>Request Decline</b>,
          error: <b>Error in Declining Request</b>,
        },
        {
          position: "bottom-center",
        }
      )
      .then(() => {
        setRefereshGridData(!refereshGridData);
      });
    console.log("Rejext", id);
  }

  const columns = [
    {
      field: "submitted_by",
      headerName: "Submitted By",
      flex: 4,
      sortable: false,
    },
    { field: "tile_name", headerName: "Tile Name", flex: 4, sortable: false },
    { field: "status", headerName: "Status", flex: 4, sortable: false },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 2,
      width: 100,
      renderCell: (params: any) =>
        params.row.status == "Pending" ? (
          <div className="flex gap-6 justify-between">
            <Button
              variant="outlined"
              size="small"
              color="error"
              sx={{
                fontSize: "12px",
                padding: "3px",
                textTransform: "capitalize",
              }}
              onClick={() => handleDecline(params.row.id)}
            >
              Decline
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="success"
              sx={{
                fontSize: "12px",
                padding: "3px",
                textTransform: "capitalize",
              }}
              onClick={() => handleApprove(params.row.id)}
            >
              Approve
            </Button>
          </div>
        ) : (
          "Completed"
        ),
    },
  ];
  const entity = "approval_requests";
  const initialSort = [
    {
      field: "submitted_by",
      sort: "asc",
    },
  ];
  return (
    <>
      <CustomDataGrid
        columns={columns}
        entity={entity}
        initialSort={initialSort}
        refereshGridData={refereshGridData}
        hideDataGridToolbar={true}
      />
    </>
  );
};
