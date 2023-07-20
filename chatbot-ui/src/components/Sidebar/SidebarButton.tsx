import { FC, useContext } from 'react';
import HomeContext from '@/pages/home/home.context';

interface Props {
  text: string;
  icon: JSX.Element;
  onClick: () => void;
}

export const SidebarButton: FC<Props> = ({ text, icon, onClick }) => {
  const { state : { theme } } = useContext(HomeContext);
  return (
    <button
      className={`${theme.sideBarSettingButtonTheme} flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3  transition-colors duration-200 `}
      onClick={onClick}
    >
      <div>{icon}</div>
      <span>{text}</span>
    </button>
  );
};
