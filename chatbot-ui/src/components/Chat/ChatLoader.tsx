import HomeContext from "@/pages/home/home.context";
import { IconRobot } from "@tabler/icons-react";
import { FC, useContext } from "react";

interface Props { }

export const ChatLoader: FC<Props> = () => {
  const {
    state: { theme },
  } = useContext(HomeContext);

  return (
    <div
      className={`group border-b border-black/10  ${theme.chatMessageTheme}`}
      style={{ overflowWrap: "anywhere" }}
    >
      <div className="m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] items-end">
          <IconRobot size={30} />
        </div>
        <span className="animate-bounce cursor-default mt-1 flex items-center ml-2">
          <div className={`w-3 h-3 ${theme.bgLoader} mr-1 rounded-full`}></div>
          <div className={`w-3 h-3 ${theme.bgLoader} mr-1 rounded-full`}></div>
          <div className={`w-3 h-3 ${theme.bgLoader} mr-1 rounded-full`}></div>
        </span>
      </div>
    </div>
  );
};
