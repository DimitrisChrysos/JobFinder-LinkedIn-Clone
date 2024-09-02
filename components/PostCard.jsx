import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { HiChat,  HiThumbUp } from "react-icons/hi";

const PostCard = ({p, curUser}) => {

    const { data: session } = useSession();
    const [likeData, setLikeData] = useState(p.like || []);
    const [commentData, setCommentData] = useState(p.comment || []);
    const [openComments, setOpenComments] = useState(false);
    const [text, setText] = useState("");
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
    
        setLikeData(p.like || []);
        setCommentData(p.comment || []);
        if (p.userId) fetchProfile();
    }, [p.userId, p._id]);   // Dependency array with userId to re-run if userId changes

    const handleLikePost = async () => {
        const res = await fetch('/api/post/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: p._id, userId: session?.user.id })
        });

        const result = await res.json();
        setLikeData(result.data);
    }

    const handleCommentPost = async () => {

        // e.preventDefault();

        if (text) {
            const res = await fetch('/api/post/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description: text, postId: p._id, userId: session?.user.id })
            });
    
            const result = await res.json();

            GetCommentData();
            setText("");
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    }

    const GetCommentData = async () => {
        const res = await fetch('/api/post/get-comment-for-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId: p._id })
        });

        const result = await res.json();
        setCommentData(result.data.comment || []);
    }

    useEffect(() => {
        if (openComments) {
            GetCommentData();
        }
    }, [openComments]);

    const handleOpenCloseComment = () => {
        setOpenComments(previous => !previous);
    }

    const currentUserLiked = likeData.includes(session?.user.id);


    // Function to handle the text change event on post comment
    const handleTextChange = (e) => {
        setText(e.target.value);
        e.target.style.height = 'auto'; // Reset the height
        e.target.style.height = `${e.target.scrollHeight}px`; // Set the height based on the scroll height
    };

    return (
        <div className="shadow-lg mt-5 rounded-lg border-4 border-gray-100">
              
            {/* Avatar and Name */}
            <div className="flex items-center space-x-2 p-2">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
                    <Link href={`/view_profile/${p.userId}`}>
                        <div className="relative w-full h-full">
                            <Image 
                                src={user ? user?.path : '/assets/logo_images/default-avatar-icon.jpg'}
                                alt='avatar'
                                layout="fill"
                                objectFit="cover"
                                className='absolute inset-0 w-full h-full cursor-pointer'  
                            />
                        </div>
                    </Link>
                </div>
                <div>
                    <span className="font-bold">{user?.name} {user?.surname}</span>
                </div>
            </div>
            
            {p.text != "no-text" && (
            <>
                <div className="mx-2">
                    <div className="text-sm p-2 break-words" >
                        {p.text}
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
                        alt="avatar"                        
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

            
            {/* Likes and Comments */}            
            <div className="flex items-center space-x-1 mx-4 text-lg justify-between">
                <div 
                    className="flex items-center space-x-1 cursor-pointer hover:text-blue-400 transition-colors duration-100" 
                    onClick={handleLikePost}
                >
                    { currentUserLiked ? (
                        <>
                            <HiThumbUp className="my-4 text-2xl text-blue-400"/>
                            <span className="text-blue-400 font-semibold">{likeData.length}</span>
                        </>
                    ) : (
                        <>
                            <HiThumbUp className="my-4 text-2xl"/>
                            <span>{likeData.length}</span>
                        </>
                    )}
                </div>
                <div 
                    className="flex items-center space-x-1 cursor-pointer hover:text-blue-400 transition-colors duration-150"
                    onClick={handleOpenCloseComment}
                >
                    <HiChat className="my-4 text-2xl"/>
                    <span>{commentData.length}</span>
                </div>
            </div>

            {/* Comments */}
            { openComments && (
                <>
                    <hr className="border-t-2 border-gray-300 mx-auto" style={{ width: '95%' }}/>
                    <div className="p-4">

                        {/* Add a comment */}
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
                                value={text}
                                placeholder="Add a comment..."
                                style={{ overflow: 'hidden', resize: 'none' }} // Prevent manual resizing
                                className="border border-gray-400 p-2 rounded-md w-4/5 flex flex-col justify-between focus:outline-none"
                                rows="1"
                            />
                            { text !== "" && (
                                <button 
                                    className="text-blue-400 rounded-md p-2 hover:bg-blue-100 transition-colors duration-150"
                                    onClick={handleCommentPost}
                                >
                                    Send
                                </button>
                            )}
                        </div>

                        {/* Dispplay all comments */}
                        <div>
                            {
                                commentData.map((comment, index) => {
                                    return (
                                        <div className="ml-2 border-b p-2" key={comment?._id}>
                                            <div className="flex items-center space-x-2 p-2">
                                                <div className="relative w-8 h-8 min-w-[32px] min-h-[32px] rounded-full overflow-hidden border-2 border-gray-300 p-1">
                                                    <Link href={`/view_profile/${comment?.userId?._id}`}>
                                                        <Image 
                                                            src={comment?.userId?.path}
                                                            alt='avatar' 
                                                            layout="fill"
                                                            objectFit="cover"
                                                            className='absolute inset-0 w-full h-full cursor-pointer'  
                                                        />
                                                    </Link>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-xs">{comment?.userId?.name} {comment?.userId?.surname}</p>
                                                </div>
                                            </div>
                                            <div className="mx-2">
                                                <div className="text-sm mt-1 break-words" >
                                                    {comment.description}
                                                </div>
                                            </div>
                                        </div>
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

export default PostCard