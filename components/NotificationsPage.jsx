'use client';

import Image from "next/image"
import { useSession } from 'next-auth/react';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineCheck, HiX } from "react-icons/hi";
import { HiChat,  HiThumbUp } from "react-icons/hi";
import Loading from "./Loading";


const NotificationsPage = () => {

    const { data: session } = useSession();
    const [error, setError] = useState(null);
    const [requests, setRequests] = useState([-1]);
    const [accepted, setAccepted] = useState(false); // it is used to re-run the useEffect when a request is accepted
    const [rejected, setRejected] = useState(false); // it is used to re-run the useEffect when a request is rejected
    const [notifications, setNotifications] = useState([-1]);
    const [removeNotification, setRemoveNotification] = useState(false);
    const router = useRouter();

    const fetchRequestsInfo = async () => {
        try {
            const res = await fetch(`/api/connections/requests/${session?.user.id}`);
            if (!res.ok) {
                throw new Error('Failed to fetch connections data');
            }
            const data = await res.json();
            setRequests(data.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const fetchNotificationsInfo = async () => {
        try {
            if (removeNotification)
                setRemoveNotification(false);
            const res = await fetch(`/api/notifications/${session?.user.id}`);
            if (!res.ok) {
                throw new Error('Failed to fetch notifications data');
            }
            const data = await res.json();
            setNotifications(data.data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {

        if(session?.user.id) {
            fetchRequestsInfo();
            fetchNotificationsInfo();
            setAccepted(false);
            setRejected(false);
        }
    }, [session?.user.id, accepted, rejected, removeNotification]);   // Dependency array with userId to re-run if userId changes

    if (error) {
        return <div>Error: {error}</div>;
    }

    if ((requests.length == 1 && requests[0] == -1) || (notifications.length == 1 && notifications[0] == -1)) {
        return (
            <Loading />
        );
    }

    // remove the request from the requests list
    const handleRejectConnection = async (senderId) => {
        const res = await fetch('/api/connections/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: session?.user.id, senderId: senderId })
        });

        setRejected(true);
    };

    // remove the request from the requests list and make the connection
    const handleAcceptConnection = async (senderId) => {

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

        setAccepted(true);
    };

    // remove the notification from the notifications list
    const handleRemoveNotification = async (notificationId) => {

        try {
            const res = await fetch(`/api/notifications/${session?.user.id}?notificationId=${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!res.ok)
                throw new Error('Failed to delete notification');
            else
                setRemoveNotification(true);
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

  return (
    <div className="container mt-20">
        <div>
            <section className="w-full flex justify-center items-center">
                <h1 className="text-md leading-[1.15] text-gray-500 sm:text-6xl;">
                    {requests.length == 0 ? "You have no connection requests" : requests.length == 1 
                        ? `You have ${requests.length} connection request` : 
                        `You have ${requests.length} connection requests`}
                </h1>
            </section>
            
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 ">
                {requests && requests.map(req => (
                    <div key={req._id} className="w-full shadow-lg p-4 rounded-lg border-t-4 border-blue-400 text-xs">
                        <div className="flex items-center justify-center space-x-3 py-1">
                            <div className="relative w-10 h-10 min-w-[40px] min-h-[40px] rounded-full overflow-hidden flex items-center justify-center zoom_effect border-2  border-gray-300 p-1">
                                <Link href={`/view_profile/${req._id}`}>
                                    <Image 
                                        src={req?.path}
                                        alt="avatar" 
                                        layout="fill"
                                        objectFit="cover"
                                        className="absolute inset-0 w-full h-full" 
                                    />
                                </Link>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold text-sm">{req.name}<br />{req.surname}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                            <button 
                                className="text-white bg-green-400 border border-green-400 rounded-md font-bold py-1 px-5 mt-1 transition-all hover:bg-white hover:text-green-400 text-center text-sm font-inter flex items-center justify-center gap-2"
                                onClick={() => handleAcceptConnection(req._id)}
                            >
                                <HiOutlineCheck size={20}/>
                            </button>
                            <button 
                                className="text-white bg-red-500 border border-red-500 rounded-md font-bold py-1 px-5 mt-1 transition-all hover:bg-white hover:text-red-500 text-center text-sm font-inter flex items-center justify-center gap-2"
                                onClick={() => handleRejectConnection(req._id)}
                            >
                                <HiX size={20}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>

        <div className="mt-10">
            <section className="w-full flex justify-center items-center">
                <h1 className="text-md leading-[1.15] text-gray-500 sm:text-6xl;">
                    {notifications.length == 0 ? "You have no notifications" : notifications.length == 1 
                        ? `You have ${notifications.length} notifications` : 
                        `You have ${notifications.length} notifications`}
                </h1>
            </section>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
            {notifications && notifications.map(not => (
                <div key={not._id} className="w-full shadow-lg p-4 rounded-lg border-t-4 border-blue-400 text-xs">
                    <div className="flex items-center justify-center space-x-3 py-1">
                        <div>
                            <span className="font-semibold text-sm">
                                <div className="flex items-center justify-between">
                                    {not.description == " commented on your " ? 
                                        <HiChat size={22} className="text-blue-400 mb-2" /> 
                                        :
                                        <HiThumbUp size={22} className="text-blue-400 mb-2" /> 
                                    }
                                    <HiX size={22} 
                                        className="text-gray-300 mb-2 cursor-pointer"
                                        onClick={() => handleRemoveNotification(not._id)}
                                    />
                                </div>
                                {not.userId?._id ?
                                    <Link href={`/view_profile/${not.userId._id}`} className="text-blue-500 hover:underline">
                                        <span> {not.userId.name} {not.userId.surname}, </span>
                                    </Link>
                                    :
                                    <span>Deleted user, </span>
                                }
                                {not.description}
                                <Link href={`/post_view/${not.postId}`} className="text-blue-500 hover:underline">
                                    post.
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            </div>
            
        </div>
    </div>
  )
}

export default NotificationsPage