import React, { FC, useState, useRef, useEffect, useMemo } from "react";
import { Tile } from "../../types/tiles";
import HomeContext from "@/pages/home/home.context";
import { useContext } from "react";
import "./styles.scss";
import { RequestAccess, getTiles } from "@/services";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";
import * as Icons from "@tabler/icons-react";

const Tiles: FC = () => {
  const {
    state: { selectedTile, tiles, theme },
    handleSelectedTile,
    dispatch,
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

  useEffect(() => {
    if (tiles.length) return;
    getTiles().then((res) => {
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
    });
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
    <>
      <div className="flex align-center">
        {scrollX !== 0 && (
          <button
            className={`m-1 hover:scale-125 transition-transform duration-300 ease-in-out ${theme.textColorSecondary}`}
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
        {tiles &&
          tiles.map((curr_tile, index) => (
            <div
              key={index}
              className={`flex flex-col gap-5 rounded-lg p-4 cursor-pointer tile 
              ${selectedTile.code !== curr_tile.code && theme.tilesHoverTheme}
              ${theme.textColorSecondary}
              ${theme.chatItemsBorder}
              ${selectedTile.code === curr_tile.code && theme.tileSelectedTheme}
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
      <div className="flex align-center">
        {!scrolEnd && (
          <button
            className={`m-1 hover:scale-125 transition-transform duration-300 ease-in-out ${theme.textColorSecondary}`}
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
