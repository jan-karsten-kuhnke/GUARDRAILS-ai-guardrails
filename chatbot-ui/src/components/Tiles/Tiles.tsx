import React, { FC, useState, useRef, useEffect, useMemo } from "react";
import { Tile } from "../../types/tiles";
import HomeContext from "@/pages/home/home.context";
import { useContext } from "react";
import "./styles.scss";
import { getTiles } from "@/services";
import {
  IconChevronRight,
  IconChevronLeft,
  IconRefreshDot,
} from "@tabler/icons-react";
import * as Icons from "@tabler/icons-react";
import { Divider, Tooltip } from "@mui/material";

const Tiles: FC = () => {
  const {
    state: { selectedTile, tiles, theme },
    handleSelectedTile,
    dispatch,
  } = useContext(HomeContext);
  const scrl = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

  const handleGetTiles = () => {
    if (loading) return;
    setLoading(true);
    getTiles()
      .then((res) => {
        if (res && res.data) {
          let defaultTile = res.data.find(
            (item: Tile) => item.code === "conversation"
          );
          let sortedData = res.data.sort(
            (a: any, b: any) => Number(b.has_access) - Number(a.has_access)
          );
          dispatch({ field: "tiles", value: sortedData });
          dispatch({ field: "selectedTile", value: defaultTile ?? {} });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tiles.length) return;
    handleGetTiles();
  }, []);

  const getIcon = useMemo(() => {
    type ObjectKey = keyof typeof Icons;
    return (val: string) => {
      const myVar = val as ObjectKey;
      const Icon = Icons[myVar];
      //@ts-ignore
      return React.createElement(Icon, { size: 50 });
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div
        className={`flex justify-between items-center p-2 px-4 rounded-lg ${theme.tilesTheme.header}`}
      >
        <span className={`text-xl ml-3`}>Select task</span>
        <div className="flex">
          <Tooltip title="Refresh tasks" placement="top">
            <button
              className={`${
                loading && "animate-spin opacity-50 cursor-not-allowed"
              } m-1 hover:scale-110 transition-transform duration-300 ease-in-out p-0.5 mr-2 border rounded-full`}
              onClick={handleGetTiles}
            >
              <IconRefreshDot />
            </button>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ margin: "0 20px",backgroundColor: "white", opacity: 0.3 }} />
          <span>
            <button
              className={`m-1 hover:scale-110 transition-transform duration-300 ease-in-out p-0.5 mr-2 border rounded-full ${
                scrollX === 0 && "opacity-30 cursor-not-allowed hover:scale-100"
              }`}
              onClick={() => slide(-300)}
              disabled={scrollX === 0}
            >
              <IconChevronLeft size={25} />
            </button>

            <button
              className={`m-1 hover:scale-110 transition-transform duration-300 ease-in-out p-0.5 border rounded-full ${
                scrolEnd && "opacity-30 cursor-not-allowed hover:scale-100"
              }`}
              onClick={() => slide(+300)}
              disabled={scrolEnd}
            >
              <IconChevronRight size={25} />
            </button>
          </span>
        </div>
      </div>
      <div
        ref={scrl}
        onScroll={scrollCheck}
        className="flex gap-5 overflow-x-scroll p-3 scroll-smooth hideScrollBar"
      >
        {tiles &&
          tiles.map((curr_tile, index) => (
            <div
              key={index}
              className={`flex flex-col gap-5 rounded-lg p-4 cursor-pointer tile 
              text-[${theme.textColorSecondary}]
              ${selectedTile.code !== curr_tile.code && theme.tilesTheme.hover}
              ${theme.chatItemsBorder}
              ${
                selectedTile.code === curr_tile.code &&
                theme.tilesTheme.selected
              }
              ${!curr_tile.is_active && "opacity-30"}
              ${!curr_tile.has_access && "opacity-50"}`}
              onClick={(e) => {
                if (!curr_tile.is_active) return;
                handleTileSelect(curr_tile);
              }}
            >
              <div className="flex justify-center align-center h-16 min-w-[100px]">
                {getIcon(curr_tile.icon)}
              </div>
              <div className="text-center min-w-[100px]">{curr_tile.title}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Tiles;
