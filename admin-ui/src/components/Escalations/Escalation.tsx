import { CustomDataGrid } from "../DataGrids/CustomDataGrid";

export const Escalation = () => {

  const columns = [
    { field: "user_email", headerName: "User",flex: 2 },
    { field: "title", headerName: "title",flex: 2 },
    { field: "state", headerName: "State",flex: 1 },
    { field: "created", headerName: "Time" ,flex: 2},
];
  const entity = 'escalations'
  const initialSort = [
    {
      field: "created_at",
      sort: "desc",
    },
  ];
  return (
   <CustomDataGrid columns={columns} entity={entity} initialSort={initialSort} />
  );
};