
import React, { useEffect, useState,useContext } from "react";
import { DataGrid, GridToolbar, GridSortModel, useGridApiContext, useGridSelector, gridPageSelector, gridPageCountSelector,GridRowParams  } from "@mui/x-data-grid";
import {  getDocsGridData } from "@/services/DocsService";
import TablePagination from '@mui/material/TablePagination';

import toast from "react-hot-toast";
import HomeContext from "@/pages/home/home.context";
interface CustomDataGridProps {
    columns: any;
    entity: string;
    initialSort: any;
    refereshGridData?:boolean;
}

interface RowData {
  id: number;
  title: string;
  messages:Message[];
  // Add more fields as needed
}
export type Role = 'assistant' | 'user' | 'guardrails';
export interface Message {
  role: Role;
  content: string;
  userActionRequired: boolean;
}
export const CustomDataGrid = (props: CustomDataGridProps) => {
  const { state : { theme } } = useContext(HomeContext);

    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({});
    const [sortConfig, setSortConfig] = useState<GridSortModel>(props.initialSort);
    const [range, setRange] = useState([0, 9]);
    const [paginationModel, setPaginationModel] = useState({
      pageSize: 10,
      page: 0,
    });

    useEffect(() => {
        fetchData();
      }, [sortConfig, range, filter, props?.refereshGridData]);
    
      const fetchData = async () => {
        setLoading(true);
        const sort = [sortConfig[0].field, sortConfig[0].sort];
        const params = {
          filter: filter,
          range: range,
          sort: sort,
        };
    
        try {
          let response;
          
          response = await getDocsGridData(props.entity,params);
      
          const { data:body } = response;
          const { data, success, message  } = body
          if(success == false)
          {
            toast.error(message,{
              duration:3000,
              position:"bottom-center"
            })
            return
          }
          
          const {rows , totalRows} = data;

          setRows(rows);
          setTotalRows(totalRows);
        } catch (error:any) {
            console.error("Error fetching data: \n", error);
            toast.error(error?.message,{
              duration:3000,
              position:"bottom-center"
            })
        } finally {
          setLoading(false);
        }
        
      };

      const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
      ) => {
        setPaginationModel({ ...paginationModel, page:newPage });
        /// No need of this logic if we can pass range more than totalRows
        let pageSize=paginationModel.pageSize
        const upperRange =
          (newPage + 1) * pageSize - 1 > totalRows
            ? totalRows
            : (newPage + 1) * pageSize - 1;
        setRange([newPage * pageSize, upperRange]);
      };
    
      const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        let pageSize=parseInt(event.target.value, 10)
        setPaginationModel({ page:0, pageSize:pageSize });
        setRange([0, pageSize<totalRows?pageSize-1:totalRows-1]);
      };
       
      const handleSortChange = (params: any) => {
        /// Feels like there is a bug in Datagrid. When we click 3 times faster on a column it passes empty array as params
        /// Needs further investingation if something wrong in our code or in Datagrid
        /// Currently handling that case
        if (params.length === 0)
          params = [
            {
              field: sortConfig[0].field,
              sort: sortConfig[0].sort === "asc" ? "desc" : "asc",
            },
          ];
        setSortConfig(params);
      };
    
      const handleFilterChange = (params: any) => {
        const { items }= params;
        if(!items.length){
          setFilter({});
          return;
        }
        const { field, operator, value } = items[0];
        const filterParams = {
          filterField: field,
          filterOperator: operator,
          filterValue: value ? value : "",
        };
        setFilter(filterParams);
        setPaginationModel({ ...paginationModel, page:0 });
        setRange([0, paginationModel.pageSize-1]);
      };


      const CustomPagination = () => {
        const apiRef = useGridApiContext();
        return (
          <TablePagination
            component="div"
            showFirstButton
            showLastButton
            count={totalRows}
            page={paginationModel.page}
            onPageChange={handleChangePage}
            rowsPerPage={paginationModel.pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50 ,100]}
            sx={{ 
              color: 'white',
              '& .Mui-disabled': {
                color: '#5A5A5A !important',
              },
              '& .MuiSelect-icon': {
                color: 'white',
              },
              '& .MuiIconButton-root': {
                color: 'white',
              },
            }}
          />
        );
      }
    
    return (
        <div style={{  width: "100%", padding:"0% 2%" }}>
          <DataGrid
            rows={rows}
            columns={props.columns}
            paginationMode="server"
            filterMode="server"
            sortingMode="server"
            sortModel={sortConfig}
            rowCount={totalRows}
            loading={loading}
            slots={{ pagination : CustomPagination }}
            paginationModel={paginationModel}
            
            sx={{
              backgroundColor: theme.customDataGridTheme.bGcolor,
              borderRadius: '2px',
              width: "100%",
              marginTop: '20px',
              marginBottom: '20px',
              color: 'white',
              '& .MuiDataGrid-menuIconButton,.MuiDataGrid-sortIcon,.MuiDataGrid-filterIcon': {
                color: 'white',
              },
              '&.MuiButtonBase-root ,&.MuiButton-root':{
                color: 'white !important',
              },
              table: {
                borderCollapse: "collapse",
                borderSpacing: 0,
                width: "100%",
              },
              
              thead: {
                backgroundColor: "#f0f0f0",
                color: "#333333",
                fontWeight: "bold",
                fontSize: '14px',
              },
              
              th: {
                padding: '10px 15px',
                border: '1px solid #ccc',
                borderBottom: '2px solid white', // Add bottom border
                borderRight: '1px solid white', // Add right border for vertical separator
    
                
              },
              
              td: {
                padding: '10px 15px',
                border: '1px solid #ccc',
                borderRight: '1px solid white', // Add right border for vertical separator
              },
              
              tr: {
                cursor: 'pointer',
              },
            }}
            onSortModelChange={handleSortChange}
            onFilterModelChange={handleFilterChange}
           
          />

          
        </div>
      );
}