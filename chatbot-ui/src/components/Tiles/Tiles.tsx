import React, { FC, useState, useRef, useEffect } from "react";
import { Tile } from "../../types/tiles";
import HomeContext from "@/pages/home/home.context";
import { useContext } from "react";
import "./styles.scss";
import { getTiles } from "@/services";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";
import * as Icons from '@tabler/icons-react'; 

const Tiles: FC = () => {
  const {
    state: { selectedTile,tiles },
    handleSelectedTile,
    dispatch
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
  getTiles().then((res) => {
    if(res && res.data && res.data) dispatch({ field: "tiles", value: res.data });
  });
  },[])

  const getIcon = (val:string) => {
    type ObjectKey = keyof typeof Icons;
    const myVar = val as ObjectKey;
    const Icon   = Icons[myVar];
    return React.createElement(Icon,{size:50})
  }

  return (
    <>
      <div className="flex align-center">
        {scrollX !== 0 && (
          <button
            className="prev m-1 hover:scale-125 transition-transform duration-300 ease-in-out text-black dark:text-gray-300"
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
        {tiles.map((curr_tile, index) => (
          <div
            key={index}
            className={`flex flex-col gap-5 justify-center text-black  rounded-lg border border-neutral-200 p-4 dark:text-gray-400 dark:border-neutral-600 hover:bg-[#595959] dark:hover:bg-[#202123] cursor-pointer ${
              selectedTile === curr_tile && "bg-[#595959] dark:bg-[#202123]"
            } ${!curr_tile.is_active && "opacity-30"}`}
            onClick={(e) => {
              if(!curr_tile.is_active) return;
              handleTileSelect(curr_tile);
            }}
          >
            <div className="flex justify-center">{getIcon(curr_tile.icon)}</div>
            <div className="text-center ">{curr_tile.title}</div>
          </div>
        ))}
      </div>
      <div className="flex align-center">
        {!scrolEnd && (
          <button
            className="next m-1 hover:scale-125 transition-transform duration-300 ease-in-out text-black dark:text-gray-300"
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
