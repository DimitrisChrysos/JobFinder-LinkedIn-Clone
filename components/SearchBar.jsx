'use client';

import React from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { useState } from 'react';
import Link from "next/link";
import { HiOutlineSearch } from 'react-icons/hi';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value) {
      try {
        const res = await fetch(`/api/search?query=${value}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setResults(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div className="relative w-full max-w-md mx-auto">
        <div className="flex items-center border rounded-full w-full p-2 shadow-lg bg-white">
          <div className='relative flex-1 space-x-4'>
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={query} 
              onChange={handleInputChange} 
              placeholder="Search users..." 
              className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 border-none"
            />
          </div>
        </div>
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 mx-auto bg-white border rounded-lg mt-2 w-11/12 max-w-md max-h-60 overflow-y-auto z-10 shadow-lg">
            {results.map(user => (
              <>
                {!user.admin ? (
                  <Link href={`/view_profile/${user._id}`} key={user._id}>
                    <li className="p-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-none">
                      {user.name} {user.surname}
                    </li>
                  </Link>
                ) : (
                  <Link href={`/view_profile/${user._id}`} key={user._id}>
                    <li className="p-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-none">
                      {user.name}
                    </li>
                  </Link>
                )}
              </>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBar;