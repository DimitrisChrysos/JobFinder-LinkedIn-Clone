'use client';

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react";
import { getUserById } from "@utils/getUserFromID";
import PostCard from "@components/PostCard";
import Loading from "@components/Loading";

const PostView = ({ params }) => {

  const { postId } = params;

  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const tempUser = await getUserById(session?.user.id);
      setUser(tempUser);
    }

    const fetchPost = async () => {
      const res = await fetch(`/api/post/${postId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch post data');
      }
      const data = await res.json();
      setPost(data.post);
    }
    
    if(session?.user.id) {
      fetchUser();  // Get the curUser with the session.user.id
      fetchPost();  // Get the post with the postId
    }
  }, [session?.user.id])

  if (!user || !post) {
    return (
      <Loading />
    );
  }


  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="mt-20 w-2/4 h-full">
        <PostCard p={post} curUser={user}/>
      </div>
    </div>
  )
}

export default PostView