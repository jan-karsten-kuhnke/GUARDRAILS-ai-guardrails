import HomeContext from "@/pages/home/home.context";
import { FormControl, MenuItem, Select } from "@mui/material";
import { FC, useContext } from "react";

interface item {
    title: string;
    value: string | number;
}

interface Props {
    data: item[];
    value: any;
    label: string;
    onChange: (e: any) => void;
    style?: Object;

}

const DropDown: FC<Props> = ({ data, value, label, onChange, style }) => {
    const {
        state: { theme },
    } = useContext(HomeContext);

    return (
        <Select
            id="demo-simple-select"
            value={value}
            sx={{
                backgroundColor: theme.selectTheme.backgroundColor,
                color: theme.selectTheme.color,
                "& .MuiSvgIcon-root": {
                    color: theme.selectTheme.color,
                }
            }}
            MenuProps={{
                PaperProps: {
                    style: { backgroundColor: "#202123", color: "white" },
                },
            }}
            onChange={(e) => onChange(e.target.value)}
        >
            <MenuItem value={"None"} disabled={true}>{label}</MenuItem>
            {
                data.length && data.map((item: any, index: number) => (
                    <MenuItem value={item?.value} key={index} >{item?.title}</MenuItem>
                ))
            }
        </Select>
    );
}

export default DropDown;