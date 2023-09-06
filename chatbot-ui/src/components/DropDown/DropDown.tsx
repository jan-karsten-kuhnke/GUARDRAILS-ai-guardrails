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
    defaultSelectable?: boolean;
    color?: string;
    backgroundColor?: string;
}

const DropDown: FC<Props> = ({ data, value, label, onChange, defaultSelectable, color, backgroundColor }) => {
    const {
        state: { theme },
    } = useContext(HomeContext);

    return (
        <Select
            id="demo-simple-select"
            value={value}
            sx={{
                color: color || theme.selectTheme.color,
                backgroundColor: backgroundColor || theme.selectTheme.backgroundColor,
                "& .MuiSvgIcon-root": {
                    color: theme.selectTheme.color,
                },
                "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.selectTheme.hoverBorderColor,
                },
            }}
            MenuProps={{
                PaperProps: {
                    style: { backgroundColor: theme.selectTheme.optionBgColor, color: theme.selectTheme.optionColor },
                },
            }}
            onChange={(e) => onChange(e.target.value)}
        >
            <MenuItem value={"None"} disabled={defaultSelectable ? false : true}>{label}</MenuItem>
            {
                data.length > 0 && data.map((item: any, index: number) => (
                    <MenuItem value={item?.value} key={index} >{item?.title}</MenuItem>
                ))
            }
        </Select>
    );
}

export default DropDown;