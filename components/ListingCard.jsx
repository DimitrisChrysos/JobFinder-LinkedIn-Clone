import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { HiChat } from "react-icons/hi";

const ListingCard = ({p, curUser}) => {

    const { data: session } = useSession();
    const [applicationData, setApplicationData] = useState(p.application || []);
    const [openApplications, setOpenApplications] = useState(false);
    const [description, setDescription] = useState("");
    const textareaRef = useRef(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    // Fetch the user's profile data
    useEffect(() => {
        const fetchProfile = async () => {
          try {
            const res = await fetch(`/api/profile/${p.userId}`, {cache: "no-store"});
            if (!res.ok) {
              throw new Error('Failed to fetch user data');
            }
            const data = await res.json();
            setUser(data.user);
          } catch (error) {
            setError(error.message);
          }
        };
    
        // setLikeData(p.like || []);
        setApplicationData(p.application || []);
        if (p.userId) fetchProfile();
    }, [p.userId, p._id]);   // Dependency array with userId to re-run if userId changes

    const handleApplicationListing = async () => {

        // e.preventDefault();

        if (description) {
            const res = await fetch('/api/listing/application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description: description, listingId: p._id, userId: session?.user.id })
            });
    
            const result = await res.json();

            GetApplicationData();
            setDescription("");
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    }

    const GetApplicationData = async () => {
        const res = await fetch('/api/listing/get-application-for-listing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ listingId: p._id })
        });

        const result = await res.json();
        setApplicationData(result.data.application || []);
    }

    useEffect(() => {
        if (openApplications) {
            GetApplicationData();
        }
    }, [openApplications]);

    const handleOpenCloseApplication = () => {
        setOpenApplications(previous => !previous);
    }

    // const currentUserLiked = likeData.includes(session?.user.id);


    // Function to handle the text change event on post comment
    const handleTextChange = (e) => {
        setDescription(e.target.value);
        e.target.style.height = 'auto'; // Reset the height
        e.target.style.height = `${e.target.scrollHeight}px`; // Set the height based on the scroll height
    };

    return (
        <div className="shadow-lg mt-5 rounded-lg border-4 border-gray-100">
              
            {/* Avatar and Name */}
            <div className="flex items-center space-x-2 p-2">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 p-1">
                    <Link href={`/view_profile/${p.userId}`}>
                        <Image 
                            src={user?.path}
                            alt='avatar' 
                            layout="fill"
                            objectFit="cover"
                            className='absolute inset-0 w-full h-full cursor-pointer'  
                        />
                    </Link>
                </div>
                <div>
                    <span className="font-bold">{user?.name} {user?.surname}</span>
                </div>
            </div>
            
            {p.job_pos != "no-text" && (
            <>
                <div className="mx-2">
                    <div className="text-lg font-bold p-2 break-words" >
                        {p.job_pos}
                    </div>
                </div>
            </>
            )}

            {p.description != "no-text" && (
            <>
                <div className="mx-2">
                    <div className="text-sm p-2 break-words" >
                        {p.description}
                    </div>
                </div>
            </>
            )}

            {p.path !== "no-file" && (
            (() => {
                const fileExtension = p.path.split('.').pop().toLowerCase();

                // Check what is the file type
                if (['jpg', 'jpeg', 'png', 'gif', 'jfif', 'bmp', 'tiff', 'svg', 'webp'].includes(fileExtension)) {
                // If file is an image
                return (
                    <div className="relative w-full mt-2 overflow-hidden flex items-center justify-center">
                    <Image 
                        src={p?.path.startsWith('/') ? p.path : `/${p.path}`}
                        layout="responsive"
                        width={100}
                        height={100}
                        objectFit="contain"
                        className="w-full"
                    />
                    </div>
                );
                } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                // If file is a video
                return (
                    <div className="relative w-full mt-2 overflow-hidden flex items-center justify-center">
                    <video 
                        src={p?.path.startsWith('/') ? p.path : `/${p.path}`} 
                        controls 
                        className="w-full h-auto"
                    >
                        Your browser does not support the video tag.
                    </video>
                    </div>
                );
                } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
                // If file is audio
                return (
                    <div className="relative h-full w-full mt-2 overflow-hidden flex items-center justify-center">
                    <audio 
                        src={p?.path.startsWith('/') ? p.path : `/${p.path}`} 
                        controls 
                        className="w-full h-auto m-0 p-0"
                    >
                        Your browser does not support the audio element.
                    </audio>
                    </div>
                );
                } else {
                // Unknown file type
                return <div>Unsupported file type</div>;
                }
            })()
            )}

            
            {/* Applications */}
            <div className="flex items-center justify-between mx-4 text-lg p-2">
                <span className="ml-auto">
                    <button
                        className="bg-blue-400 text-white border border-blue-400 px-3 py-1 rounded hover:bg-white hover:text-blue-400 transition-colors duration-150"
                        onClick={handleOpenCloseApplication}
                    >
                        Applications
                    </button>
                </span>
            </div>

            {/* Applications */}
            { openApplications && (
                <>
                    <hr className="border-t-2 border-gray-300 mx-auto" style={{ width: '95%' }}/>
                    <div className="p-4">

                        {/* Add an application */}
                        <div className="flex items-center space-x-2 p-2">
                            <div className="relative w-12 h-12 min-w-[48px] min-h-[48px] rounded-full overflow-hidden border-2 border-gray-300 p-1">
                                <Link href={`/view_profile/${curUser?._id}`}>
                                    <Image 
                                        src={curUser?.path}
                                        alt='avatar' 
                                        layout="fill"
                                        objectFit="cover"
                                        className='absolute inset-0 w-full h-full cursor-pointer'  
                                    />
                                </Link>
                            </div>
                            <textarea
                                ref={textareaRef}
                                onChange={handleTextChange} 
                                value={description}
                                placeholder="Apply for the position..."
                                style={{ overflow: 'hidden', resize: 'none' }} // Prevent manual resizing
                                className="border border-gray-400 p-2 rounded-md w-4/5 flex flex-col justify-between focus:outline-none"
                                rows="1"
                            />
                            { description !== "" && (
                                <button 
                                    className="text-blue-400 rounded-md p-2 hover:bg-blue-100 transition-colors duration-150"
                                    onClick={handleApplicationListing}
                                >
                                    Send
                                </button>
                            )}
                        </div>

                        {/* Dispplay all applications */}
                        <div>
                            {
                                applicationData.map((application, index) => {
                                    return (
                                        <>
                                        {session?.user.id === p.userId || session?.user.id === application?.userId?._id ? (
                                        <div className="ml-2 border-b p-2" key={application?._id}>
                                            <div className="flex items-center space-x-2 p-2">
                                                <div className="relative w-8 h-8 min-w-[32px] min-h-[32px] rounded-full overflow-hidden border-2 border-gray-300 p-1">
                                                    <Link href={`/view_profile/${application?.userId?._id}`}>
                                                        <Image 
                                                            src={application?.userId?.path}
                                                            alt='avatar' 
                                                            layout="fill"
                                                            objectFit="cover"
                                                            className='absolute inset-0 w-full h-full cursor-pointer'  
                                                        />
                                                    </Link>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-xs">{application?.userId?.name} {application?.userId?.surname}</p>
                                                </div>
                                            </div>
                                            <div className="mx-2">
                                                <div className="text-sm mt-1 break-words" >
                                                    {application.description}
                                                </div>
                                            </div>
                                        </div>
                                        ) : (
                                            <div>
                                            </div>
                                        )}
                                        </>
                                    )
                                })
                            }
                        </div>

                    </div>
                </>
            )}
        </div>
  )
}

export default ListingCard