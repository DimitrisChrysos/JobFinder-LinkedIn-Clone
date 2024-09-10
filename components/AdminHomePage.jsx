'use client';

import Image from "next/image"
import { useSession } from 'next-auth/react';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiDownload, HiOutlineDownload, HiOutlineTrash } from "react-icons/hi";
import Loading from "./Loading";
import xml2js from "xml2js";

const AdminHomePage = () => {

  const { data: session } = useSession();
  const [user, setUser] = useState(null); //
  const [users, setUsers] = useState([-1]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [errOccured, setErrOccured] = useState(false);
  
  // for the selected users of the table
  const [selectedUsers, setSelectedUsers] = useState([-1]);

  // secure the page
  if (session) {
    if (!session.user.admin) { 
        router.push('/home'); // Redirect to home if not admin
    }
  }

  // get all users
  useEffect(() => {
      const fetchProfiles = async () => {
          try {
            const res = await fetch('/api/profile', {cache: "no-store"});
            if (!res.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await res.json();
            setUsers(data.users);
          } catch (error) {
            console.log('Fetching profiles...');
          }
      };

      if(session?.user.id) 
        fetchProfiles();
  }, [session?.user.id]);   // Dependency array with userId to re-run if userId changes

  if (error) {
    return (
      <div>Error: {error}</div>
    );
  }

  if (users.length == 1 && users[0] == -1) {
    return (
      <Loading />
    );
  }

  const fetchProfile = async ( userId ) => { //
    try {
      const res = await fetch(`/api/profile/${userId}`, {cache: "no-store"});
      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await res.json();
      setUser(data.user);
      setPostCounter(data.user.post_counter);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteImage = async (id, path) => { //
    try {
        const res = await fetch(`/api/files/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, path }),
        });
  
        if (!res.ok) {
            throw new Error('Failed to delete file');
        }
  
        const data = await res.json();
        console.log(data.message); // "File deleted."
    } catch (error) {
        console.error('Error:', error.message);
    }
  };
  
  // handleCheckboxChange to select users
  const handleCheckboxChange = (id) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((e) => e !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };


  const handleXmlDownload = async () => {
    // Create an array to store the data for all the users
    const allUserData = [];

    // Loop through the selected users and get their data
    for (const userId of selectedUsers) {

      if (userId == -1) continue;

      try {
        // Get the JSON data for every user 
        const res = await fetch(`/api/download-user/${userId}`, {cache: "no-store"});
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        allUserData.push(data);
      } catch (error) {
        console.log(error.message);
      }
    }
  
    // Convert the allUserData array to XML format
    const builder = new xml2js.Builder({ rootName: 'Users', headless: true });
    const allUserDataXml = builder.buildObject({ User: allUserData });

    // Download the XML data as a file
    const blob = new Blob([allUserDataXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleJsonDownload = async () => {
    // Create an array to store the data for all the users
    const allUserData = [];

    // Loop through the selected users and get their data
    for (const userId of selectedUsers) {

      if (userId == -1) continue;

      try {
        // Get the JSON data for every user 
        const res = await fetch(`/api/download-user/${userId}`, {cache: "no-store"});
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        allUserData.push(data);
      } catch (error) {
        console.log(error.message);
      }
    }
  
    // Download the JSON data as a file
    const jsonString = JSON.stringify(allUserData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    for (const userId of selectedUsers) {
      if (userId == -1) continue;
  
      try {
        // Fetch the user's profile
        const res = await fetch(`/api/profile/${userId}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await res.json();
        
        // Check if the user's profile picture is not the default one
        if (userData.user.path !== "/assets/logo_images/default-avatar-icon.jpg") {
          await deleteImage(userData.user._id, userData.user.path);
        }
  
        // Delete the user's profile
        const deleteRes = await fetch(`/api/profile?id=${userData.user._id}`, {
          method: "DELETE",
        });
  
        if (!deleteRes.ok) {
          alert("Failed to delete account");
          setErrOccured(true);
        }
  
      } catch (error) {
        console.error("Error deleting user:", error.message);
      }
    }
    if (!errOccured) {
      alert("Accounts deleted successfully");
    }
    setErrOccured(false);
    window.location.reload();
  };

  return (
    <div className="w-full flex flex-col sm:flex-row p-2 mt-20 gap-4">


      {/* Download data of users */}
      <div className="mt-20">
        <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-400 sticky top-20">
          <div className="flex justify-center items-center mt-3 space-x-2">
            <span className="text-lg">Download selected users</span>
          </div>
          <div className="flex gap-4">
            <button 
              className="bg-blue-400 text-white border border-blue-400 mt-3 w-full font-bold py-1.5 px-5 transition-all hover:bg-white hover:text-blue-400 text-center text-sm font-inter flex items-center justify-center gap-2"
              onClick={handleXmlDownload}>
                <HiDownload size={24}/>
                <span>XML</span>
            </button>
            <button 
              className="bg-green-400 text-white border border-green-400 mt-3 w-full font-bold py-1.5 px-5 transition-all hover:bg-white hover:text-green-400 text-center text-sm font-inter flex items-center justify-center gap-2"
              onClick={handleJsonDownload}>
                <HiDownload size={24}/>
                <span>JSON</span>
            </button>
          </div>
          <button 
            className="bg-red-400 text-white border border-red-400 mt-3 w-full font-bold py-1.5 px-5 transition-all hover:bg-white hover:text-red-400 text-center text-sm font-inter flex items-center justify-center gap-2"
            onClick={handleDelete}>
              <HiOutlineTrash size={24}/>
              <span>Delete selected users</span>
          </button>
        </div>
      </div>
      
      {/* Show the list of the */}
      <div className="w-full p-2">
        {/* <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1> */}
        <div className="overflow-hidden shadow-lg p-5 rounded-lg border-t-4 border-blue-400">
          <h2 className="text-xl mb-4">List of Users</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b-2 border-gray-300">Select</th>
                <th className="py-2 px-4 border-b-2 border-gray-300 hidden md:table-cell">Email</th>
                <th className="py-2 px-4 border-b-2 border-gray-300 hidden md:table-cell">User ID</th>
                <th className="py-2 px-4 border-b-2 border-gray-300">View profile</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <>
                  {!user.admin && (
                    <tr key={user._id}>
                      <td className="py-2 px-4">
                        <div className="mx-auto flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="form-checkbox w-4 h-4" 
                            onChange={() => handleCheckboxChange(user._id)}
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4 hidden md:table-cell">
                        <div className="mx-auto flex items-center justify-center">{user.email}</div>
                      </td>
                      <td className="py-2 px-4 hidden md:table-cell">
                        <div className="mx-auto flex items-center justify-center ">{user._id}</div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto flex items-center justify-center zoom_effect border-2 border-gray-500 p-1">
                            <div className="relative w-full h-full rounded-full overflow-hidden">
                                <Link href={`/view_profile/${user._id}`}>
                                    <Image 
                                        src={user?.path}
                                        alt="avatar" 
                                        layout="fill"
                                        objectFit="cover"
                                        className="absolute inset-0 w-full h-full" 
                                    />
                                </Link>
                            </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default AdminHomePage