import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext({
  searchValue: '',
  setSearchValue: () => {},
});

export const SearchProvider = ({ children }) => {
  const [searchValue, setSearchValue] = useState('');
  return (
    <SearchContext.Provider value={{ searchValue, setSearchValue }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
