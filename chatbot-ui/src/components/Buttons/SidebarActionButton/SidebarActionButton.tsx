import { MouseEventHandler, ReactElement, useContext } from 'react';
import HomeContext from "@/pages/home/home.context";

interface Props {
  handleClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactElement;
}

const SidebarActionButton = ({ handleClick, children }: Props) => {
  const {state: {theme}} = useContext(HomeContext);
  
  return (<button
    className={`min-w-[20px] p-1 ${theme.sidebarActionButtonTheme}`}
    onClick={handleClick}
  >
    {children}
  </button>)
};

export default SidebarActionButton;
