import React, { FC, useState, useRef } from "react";
import { Tile, TilesList } from "../../types/tiles";
import HomeContext from "@/pages/home/home.context";
import { useContext } from "react";
import "./styles.scss";

import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";

const Tiles: FC = () => {
  const {
    state: { selectedTile, theme },
    handleSelectedTile,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const scrl = useRef<HTMLDivElement>(null);
  const [scrollX, setscrollX] = useState(0);
  const [scrolEnd, setscrolEnd] = useState(false);

  //Slide click
  const slide = (shift: number) => {
    if (scrl.current) {
      scrl.current.scrollLeft += shift;
      setscrollX(scrollX + shift);

      if (
        Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
        scrl.current.offsetWidth
      ) {
        setscrolEnd(true);
      } else {
        setscrolEnd(false);
      }
    }
  };


  const scrollCheck = () => {
    if (scrl.current) {
      setscrollX(scrl.current.scrollLeft);
      if (
        Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
        scrl.current.offsetWidth
      ) {
        setscrolEnd(true);
      } else {
        setscrolEnd(false);
      }
    }
  };

  const handleTileSelect = (tile: Tile) => {
    handleSelectedTile(tile);
  };

  return (
    <>
      <div className="flex align-center">
        {scrollX !== 0 && (
          <button
            className={`prev m-1 hover:scale-125 transition-transform duration-300 ease-in-out ${theme.textColorSecondary}`}
            onClick={() => slide(-300)}
          >
            <IconChevronLeft size={30} />
          </button>
        )}
      </div>
      <div
        ref={scrl}
        onScroll={scrollCheck}
        className="flex gap-5 overflow-x-scroll p-3 scroll-smooth hideScrollBar"
      >
        {TilesList.map((curr_tile, index) => (
          <div
            key={index}
            className={`flex flex-col gap-5 justify-center  rounded-lg  p-4  cursor-pointer ${theme.tilesHoverTheme} ${theme.textColorSecondary} ${theme.chatItemsBorder} ${
              selectedTile === curr_tile && theme.tileSelectedTheme
            } ${!curr_tile.enabled && "opacity-30"}`}
            onClick={(e) => {
              if(!curr_tile.enabled) return;
              handleTileSelect(curr_tile);
            }}
          >
            <div className="flex justify-center">{curr_tile.icon}</div>
            <div className="text-center ">{curr_tile.displayName}</div>
          </div>
        ))}
      </div>
      <div className="flex align-center">
        {!scrolEnd && (
          <button
            className={`next m-1 hover:scale-125 transition-transform duration-300 ease-in-out ${theme.textColorSecondary}`}
            onClick={() => slide(+300)}
          >
            <IconChevronRight size={30} />
          </button>
        )}
      </div>
    </>
  );
};

export default Tiles;
