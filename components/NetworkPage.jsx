'use client';

import SearchBar from "./SearchBar";
import Image from "next/image"
import { useSession } from 'next-auth/react';
import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { getUserById } from "@utils/getUserFromID";
import { FaSpinner } from "react-icons/fa";
import Loading from "./Loading";

const NetworkPage = ({ userId }) => {
  
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  const [connections, setConnections] = useState([]);
  const [user, setUser] = useState(null);

  const fetchConnectionsInfo = async () => {
    try {
        const res = await fetch(`/api/connections/get-all-connections/${userId}`);
        if (!res.ok) {
            throw new Error('Failed to fetch connections data');
        }
        const data = await res.json();
        setConnections(data.data);
    } catch (error) {
        setError(error.message);
    }
  };

  useEffect(() => {
    
    const fetchUser = async () => {
      const tempUser = await getUserById(userId);
      setUser(tempUser);
    }

    if(userId) {
        fetchUser();
        fetchConnectionsInfo();
    }
  }, [userId]);   // Dependency array with userId to re-run if userId changes

  if (error) {
      return <div>Error: {error}</div>;
  }

  if (!user || !connections || status === "loading") {
    return (
      <Loading />
    );
  }

  return (
    <div className="mt-20">

      <div className="mt-8">
        <SearchBar />
      </div>

      <section className="w-full mt-10 flex justify-center items-center">
        <h1 className="text-md leading-[1.15] text-gray-500 sm:text-6xl;">
          {userId === session?.user.id ? "You have" : `${user?.name}'s has` } {connections.length} connections
        </h1>
      </section>
      
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {connections && connections.map(con => (
          <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-400 text-xs w-40 h-52 mx-auto">
            <div 
              className="relative w-12 h-12 rounded-full overflow-hidden mx-auto flex items-center justify-center zoom_effect border-2 border-gray-500 p-1">
              <Link href={`/view_profile/${con._id}`}>
                <Image 
                  src={con?.path}
                  alt="avatar" 
                  fill // updated to use `fill`
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              </Link>
            </div>
            <hr className="border-t-2 border-gray-300 w-full my-4" />
            <div className="max-h-12 overflow-hidden text-ellipsis break-words">
              <span className="font-bold">{con.name}</span>
            </div>
            <div className="max-h-12 overflow-hidden text-ellipsis break-words">
              <span className="font-bold">{con.surname}</span>
            </div>
            <div className="max-h-12 overflow-hidden text-ellipsis break-words">
              <span className="font-bold">{con.job_position}</span>
            </div>
            <div className="max-h-12 overflow-hidden text-ellipsis break-words">
              <span className="font-bold">{con.employment_agency}</span>
            </div>
          </div>
        ))}
      </div>
      

    </div>
  )
}

export default NetworkPage