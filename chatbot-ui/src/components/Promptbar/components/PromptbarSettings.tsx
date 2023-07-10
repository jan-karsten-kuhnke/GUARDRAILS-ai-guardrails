import { FC, useState, useContext } from "react";
import HomeContext from "@/pages/home/home.context";

import PublicPrivateSwitch from "@/components/PublicPrivateSwitch";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Tile, TilesList } from "@/types/tiles";

interface Props {}

export const PromptbarSettings: FC<Props> = () => {
  const {
    state: { selectedConversation, selectedTile },
    handleSelectedTile,
  } = useContext(HomeContext);

  const handleChange = (event: SelectChangeEvent) => {
    handleSelectedTile(
      TilesList.find((tile) => tile.task == event.target.value) as Tile
    );
  };

  return (
    <>
      {selectedConversation?.messages.length != 0 ? (
        <div className="border-t border-white/40 pt-6">
          <FormControl fullWidth sx={{ color: "white" }}>
            <InputLabel
              id="demo-simple-select-label"
              sx={{
                color: "white",
                "&.MuiOutlinedInput-root ": {
                  color: "white",
                  outline: "white",
                },
              }}
            >
              Task
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              sx={{
                color: "white",
                "&.MuiOutlinedInput-root ": {
                  color: "white",
                  outline: "white",
                },
                "&.MuiSelect-iconOutlined": {
                  color: "white !important",
                },
              }}
              value={selectedTile.task}
              label="Task"
              onChange={handleChange}
            >
              {TilesList.map((tile, index) => (
                <MenuItem key={index} value={tile.task}>
                  {tile.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <PublicPrivateSwitch size={25} />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
