'use client';

import Image from "next/image"
import { useSession } from 'next-auth/react';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostCard from "./PostCard";
import { HiOutlineBan, HiOutlineChat, HiOutlineCheck, HiOutlineCog, HiOutlineUserAdd, HiOutlineUserGroup, HiOutlineUserRemove, HiX } from "react-icons/hi";
import Link from "next/link";
import DeleteAccountBtn from "./DeleteAccountBtn";
import Loading from "./Loading";

const ProfileView = ({ userId }) => {

    const { data: session } = useSession();
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [curUser, setCurUser] = useState(null);
    const [reqExists, setReqExists] = useState("");
    const [connectionExists, setConnectionExists] = useState(false);
    const router = useRouter();
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [publicInfo, setPublicInfo] = useState([-1]);
    const [connectedUsers, setConnectedUsers] = useState(false);

    // disable the button for 3 seconds to prevent errors
    const disableButton = async () => {
        setIsButtonDisabled(true); // Disable the button
        setTimeout(() => {
            setIsButtonDisabled(false);
        }, 3000); // Enable the button after 3 seconds
    }

    // Check if the current user has already requested the user for a connection
    const checkRequestExists = async () => {
        try {
            const res = await fetch('/api/connections/requests/request-exists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: userId, senderId: session?.user.id })
            });

            const data = await res.json();

            if (data.message === 'request exists') {
                setReqExists(data.message);
            }
            else if (data.message === 'request exists with switched roles') {
                setReqExists(data.message);
            }
            else if (data.message === 'request does not exist') {
                setReqExists(data.message);
            }
            console.log("msg: ", data.message);
        } catch (error) {
            console.log(error);
        }
    };

    const checkConnectionExists = async () => {
        try {
            const res = await fetch('/api/connections/are-connected', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id1: userId, id2: session?.user.id })
            });

            const data = await res.json();

            if (data.message === 'connection exists') {
                setConnectionExists(true);
            }
            else {
                setConnectionExists(false);
            }


        } catch (error) {
            
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/profile/${userId}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await res.json();
                // console.log(data.user);
                setUser(data.user);
            } catch (error) {
                setError(error.message);
            }
        };

        // Fetch the user's profile data
        const fetchCurProfile = async () => {
            try {
                const res = await fetch(`/api/profile/${session?.user.id}`, {cache: "no-store"});
                if (!res.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await res.json();
                setCurUser(data.user);
            } catch (error) {
                setError(error.message);
            }
        };

        // Fetch all the posts from the session user
        const getPosts = async () => {
            try {
                const res = await fetch(`/api/post?id=${userId}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await res.json();
                setPosts(data.posts)
            } catch (error) {
                console.log(error);
            }
        }

        // Fetch the public info of the user
        const getPublicInfo = async () => {
            try {
              const res = await fetch(`/api/profile/publicInfo?userId=${userId}`);
              if (!res.ok) {
                  throw new Error('Failed fetch publicInfo');
              }
              const data = await res.json();
              setPublicInfo(data.publicInfo);
              
            } catch (error) {
              console.error('Error:', error);
              return null;
            }
          };

        if(userId) {
            fetchProfile();
            fetchCurProfile();
            getPosts();
            checkConnectionExists();
            checkRequestExists();
            getPublicInfo();
        }
    }, [userId]);   // Dependency array with userId to re-run if userId changes

    console.log("userId: ", userId, "session?.user.id: ", session?.user.id);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user || !curUser || (publicInfo.length == 1 && publicInfo[0] == -1)) {
        return (
            <Loading />
        );
    }

    const handleRejectConnection = async (senderId) => {
        disableButton();

        // remove the request from the requests list
        const res = await fetch('/api/connections/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: session?.user.id, senderId: senderId })
        });

        await checkRequestExists();
    };

    const handleAcceptConnection = async (senderId) => {
        disableButton();

        // remove the request from the requests list
        const res = await fetch('/api/connections/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: session?.user.id, senderId: senderId })
        });


        // make the connection
        const result = await fetch('/api/connections/add-remove-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: session?.user.id, connectionId: senderId })
        });

        await checkConnectionExists();
    };

    const handleRemoveConnection = async (senderId) => {
        disableButton();
        
        // make the connection
        const result = await fetch('/api/connections/add-remove-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: session?.user.id, connectionId: senderId })
        });

        await checkRequestExists();
        await checkConnectionExists();
    };

    const handleAddCancelConnection = async () => {
        disableButton();
        const res = await fetch('/api/connections/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: user._id, senderId: curUser._id })
        });
        await checkRequestExists();
    }

    // Update the last chat id of the users
    const updateUsersLastChat = async (chatId) => {
        // console.log(chatId);
        const res = await fetch(`/api/chats/update-last-chat/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newChatId: chatId })
        });
        if (!res.ok)
            console.log("Error updating last chat");

        const res1 = await fetch(`/api/chats/update-last-chat/${curUser._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newChatId: chatId })
        });
        if (!res1.ok)
            console.log("Error updating last chat");
    };

    const handleCreateChat = async () => {
        try {
            // If chat already exists, redirect to the chat page
            const res = await fetch(`/api/chats/chat-exists?id1=${user._id}&id2=${curUser._id}`);
            const data = await res.json();

            if (data.message === "chat exists") {
                await updateUsersLastChat(data.data);
                router.push('/conversations');
            }
            else if (data.message === "chat does not exist") {
    
                // If chat doesn't exist, create a new chat and redirect to the chat page
                const res1 = await fetch('/api/chats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId1: user._id, userId2: curUser._id })
                });
                if (res1.ok) {
                    const data1 = await res1.json();
                    await updateUsersLastChat(data1.data);
                    router.push('/conversations');
                }
                else
                    console.log("Error starting chat");
            }
            else {
                console.log("Error starting chat");
            }
        } catch (error) {
            console.log("Error starting chat: ", error);
        }
    }
    
  return (

    <div className="w-full min-h-screen flex flex-col mt-20">
        <div className="w-full h-full flex space-x-5">

            {/* For the left page */}
            <div className="w-full">

            {/* Profile Info */}
                <div className="grid place-items-center sticky top-20">
                    <div className="w-8/12 shadow-lg rounded-lg border-t-4 border-blue-400 mt-5 p-8  flex flex-col gap-2 my-6">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto flex items-center justify-center">
                            <Image 
                                src={user?.path}
                                alt="avatar" 
                                layout="fill"
                                objectFit="cover"
                                className="absolute inset-0 w-full h-full" 
                            />
                        </div>
                        <hr className="border-t-2 border-gray-300 w-full my-4" />
                        <div className="text-sm break-words">
                            Name: <span className="font-bold">{user.name}</span> <br />
                            Surname: <span className="font-bold">{user.surname}</span> <br />
                            Email: <span className="font-bold">{user.email}</span> <br />
                            Phone Number: <span className="font-bold">{user.phone_number}</span> <br />
                            {userId === session?.user.id || connectionExists || curUser.admin ? (
                                <>
                                    {user.job_position != "" && <>
                                        Job Position: <span className="font-bold">{user.job_position}</span> <br />
                                    </>}
                                    {user.employment_agency != "" && <>
                                        Employment Agency: <span className="font-bold">{user.employment_agency}</span> <br />
                                    </>}
                                    {user.experience != "" && <>
                                        Experience: <span className="font-bold break-words">{user.experience}</span> <br />
                                    </>}
                                    {user.education != "" && <>
                                        Education: <span className="font-bold">{user.education}</span> <br />
                                    </>}
                                    {user.skills != "" && <>
                                        skills: <span className="font-bold">{user.skills}</span> <br />
                                    </>}
                                </>
                            ) : (
                                <>
                                    {publicInfo.includes("Job Position") && (
                                        <>Job Position: <span className="font-bold">{user.job_position}</span> <br /></>
                                    )}
                                    {publicInfo.includes("Employment Agency") && (
                                        <>Employment Agency: <span className="font-bold">{user.employment_agency}</span> <br /></>
                                    )}
                                    {publicInfo.includes("Experience") && (
                                        <>Experience: <span className="font-bold">{user.experience}</span> <br /></>
                                    )}
                                    {publicInfo.includes("Education") && (
                                        <>Education: <span className="font-bold">{user.education}</span> <br /></>
                                    )}
                                    {publicInfo.includes("Skills") && (
                                        <>Skills: <span className="font-bold">{user.skills}</span> <br /></>
                                    )}
                                </>
                            ) }
                        </div>
                        { (user._id != curUser._id && !curUser.admin) ? (
                            <>
                                <hr className="border-t-2 border-gray-300 w-full my-4" />
                                <div className="flex justify-center items-center gap-10 mt-3">
                                    
                                    <button 
                                        className="flex flex-col items-center text-green-500 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-green-500"
                                        onClick={handleCreateChat}
                                        >
                                            <HiOutlineChat size={26}/>
                                            <span className="hidden lg:block">Start Chat</span>
                                    </button>
                                    { !connectionExists ? (
                                        <>
                                            { reqExists==="request does not exist" ? (
                                                <button 
                                                    className="flex flex-col items-center text-blue-400 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-blue-400"
                                                    onClick={handleAddCancelConnection}
                                                    disabled={isButtonDisabled}
                                                >
                                                    <HiOutlineUserAdd size={26}/>
                                                    <span className="hidden lg:block">Add Connection</span>
                                                </button>
                                            ) : reqExists==="request exists with switched roles" ? (
                                                <>
                                                    <button 
                                                        className="flex flex-col items-center text-blue-400 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-blue-400"
                                                        onClick={() => handleAcceptConnection(user._id)}
                                                        disabled={isButtonDisabled}
                                                    >
                                                        <HiOutlineCheck size={26}/>
                                                        <span className="hidden lg:block">Accept Request</span>
                                                    </button>
                                                    <button 
                                                        className="flex flex-col items-center text-red-500 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-red-500"
                                                        onClick={() => handleRejectConnection(user._id)}
                                                        disabled={isButtonDisabled}
                                                    >
                                                        <HiX size={26}/>
                                                        <span className="hidden lg:block">Reject Request</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    className="flex flex-col items-center text-red-500 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-red-500"
                                                    onClick={handleAddCancelConnection}
                                                    disabled={isButtonDisabled}
                                                >
                                                    <HiOutlineBan size={26}/>
                                                    <span className="hidden lg:block">Cancel Request</span>
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Link href={`/network/${user._id}`}>
                                                <button className="flex flex-col items-center text-blue-400 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-blue-400">
                                                    <HiOutlineUserGroup size={26}/>
                                                    <span className="hidden lg:block">Network</span>
                                                </button>
                                            </Link>
                                            <button 
                                                className="flex flex-col items-center text-red-500 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-red-500"
                                                onClick={() => handleRemoveConnection(user._id)}
                                                disabled={isButtonDisabled}
                                            >
                                                <HiOutlineUserRemove size={26}/>
                                                <span className="hidden lg:block">Remove Connection</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                { !user.admin && (
                                    <>
                                        <hr className="border-t-2 border-gray-300 w-full my-4" />
                                        <div className="flex justify-between items-center gap-3 mt-3">
                                            {curUser.admin && (
                                                <button 
                                                    className="flex flex-col items-center text-green-500 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-green-500"
                                                    onClick={handleCreateChat}
                                                    >
                                                        <HiOutlineChat size={26}/>
                                                        <span className="hidden lg:block">Start Chat</span>
                                                </button>
                                            )}
                                            <Link href={`/settings/${user._id}`}>
                                                <button 
                                                    className="flex flex-col items-center text-blue-400 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-blue-400">
                                                    <HiOutlineCog size={26}/>
                                                    <span className="hidden lg:block">Settings</span>
                                                </button>
                                            </Link>
                                            <Link href={`/network/${user._id}`}>
                                                <button className="flex flex-col items-center text-blue-400 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-blue-400">
                                                    <HiOutlineUserGroup size={26}/>
                                                    <span className="hidden lg:block">Network</span>
                                                </button>
                                            </Link>
                                            <DeleteAccountBtn user={user}/>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* For the right page */}
            { !user.admin && (
                <div className="w-3/5">
                    <div className="w-full h-full">
                        {posts.length ? posts
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort posts by date (latest first)
                        .map(p => (
                            <PostCard p={p} curUser={curUser}/>    // Mh to peirakseis // key={p._id} //
                        )) : (
                            <>
                                { user._id == curUser._id ? (
                                    <div className="flex flex-col justify-center items-center mt-10 space-y-4">
                                        <span className="text-lg text-gray-500">You have not made any posts yet.</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-center items-center mt-10 space-y-4">
                                        <span className="text-lg text-gray-500">{user.name} has not made any posts yet.</span>
                                    </div>
                                ) }
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    </div>
  )
}

export default ProfileView