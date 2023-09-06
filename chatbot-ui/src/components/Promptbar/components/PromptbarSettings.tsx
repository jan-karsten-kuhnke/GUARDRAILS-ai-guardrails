import { FC, useContext, ChangeEvent } from "react";
import HomeContext from "@/pages/home/home.context";

// import PublicPrivateSwitch from "@/components/PublicPrivateSwitch";
import { Tile } from "@/types/tiles";

interface Props { }

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
      {selectedConversation?.messages.length != 0 && (
        <>
          {/* <div className={`pt-6 ${theme.dividerTopTheme}`}>
            <PublicPrivateSwitch size={25} />
          </div> */}
        </>
      )}
    </>
  );
};
