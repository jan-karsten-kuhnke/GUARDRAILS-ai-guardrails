import { FC, useContext, ChangeEvent } from "react";
import HomeContext from "@/pages/home/home.context";

import PublicPrivateSwitch from "@/components/PublicPrivateSwitch";
import { Tile } from "@/types/tiles";

interface Props {}

export const PromptbarSettings: FC<Props> = () => {
  const {
    state: { selectedConversation, selectedTile, tiles, theme },
    handleSelectedTile,
  } = useContext(HomeContext);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    handleSelectedTile(
      tiles.find((tile) => tile.code == event.target.value) as Tile
    );
  };

  return (
    <>
      {selectedConversation?.messages.length != 0 ? (
        <div className={`pt-6 ${theme.dividerTopTheme}`}>
          <label
            htmlFor="tilelist"
            className={`block mb-2 text-sm font-medium ${theme.textColor}`}
          >
            Select Task
          </label>
          <select
            id="tilelist"
            value={selectedTile.code}
            className={`${theme.taskSelectTheme} outline-none text-sm rounded-lg block w-full p-2.5`}
            onChange={handleChange}
          >
            {tiles.map((tile, index) => (
                <option value={tile.code} key={index} className="py-2">{tile.title}
                </option>
              ))}
          </select>
          <PublicPrivateSwitch size={25} />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
