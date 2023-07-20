import HomeContext from '@/pages/home/home.context';
import { IconX } from '@tabler/icons-react';
import { FC, useContext } from 'react';

interface Props {
  placeholder: string;
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
}
const Search: FC<Props> = ({ placeholder, searchTerm, onSearch }) => {
  const { state : { theme } } = useContext(HomeContext);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    onSearch('');
  };

  return (
    <div className="relative flex items-center">
      <input
        className={`${theme.searchBoxTheme} w-full flex-1 rounded-md border  px-4 py-3 pr-10 text-[14px] leading-3 `}
        type="text"
        placeholder={(placeholder) || ''}
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {searchTerm && (
        <IconX
          className="absolute right-4 cursor-pointer text-neutral-300 hover:text-neutral-400"
          size={18}
          onClick={clearSearch}
        />
      )}
    </div>
  );
};

export default Search;
