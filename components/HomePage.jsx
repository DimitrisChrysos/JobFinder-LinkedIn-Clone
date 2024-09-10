'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import LeftHomePage from "./LeftHomePage";
import RightHomePage from "./RightHomePage";
import TopHomeBar from "./TopHomeBar";
import Loading from "./Loading";
import { selectPosts } from "@utils/selectPosts";
import { FaSpinner } from "react-icons/fa";

const HomePage = () => {

  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const postsPerIteration = 5;
  const [seenPostIndexStart, setSeenPostIndexStart] = useState(0);
  const [seenPostIndexEnd, setSeenPostIndexEnd] = useState(postsPerIteration);
  const [isFetching, setIsFetching] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [curPostIteration, setCurPostIteration] = useState([]);

  
  // Redirect to admin page if the user is an admin
  if (session?.user.admin)
    redirect("/home_admin");

  useEffect(() => {
    
    // Fetch the user's profile data
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${session?.user.id}`, {cache: "no-store"});
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
    
    // Fetch initial posts
    const getPosts = async () => {
      const posts = await selectPosts(session?.user.id, seenPostIndexStart, seenPostIndexEnd);
      if (posts.length === 0) {
        setNoMorePosts(true);
        return;
      }
      setPosts(posts);
      setCurPostIteration(posts);
    };

    if (session?.user.id) {
      fetchProfile();
      getPosts();
    }
  }, [session?.user.id]);

  // Infinite scroll logic
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (noMorePosts || isFetching) return;

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMorePosts();
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, noMorePosts, seenPostIndexEnd, session?.user.id, curPostIteration]);

  // Add views to the posts
  const addViews = async () => {
    if (!curPostIteration.length) return;
    const postIds = curPostIteration.map(p => p._id);
    const res = await fetch('/api/post/views', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postIds }),
    });
    if (!res.ok) {
      throw new Error('Failed to add a view to each post');
    }
  }

  // Load more posts
  const loadMorePosts = async () => {

    setIsFetching(true);
    const newSeenPostIndexStart = seenPostIndexEnd;
    const newSeenPostIndexEnd = seenPostIndexEnd + postsPerIteration;

    const newPosts = await selectPosts(session?.user.id, newSeenPostIndexStart, newSeenPostIndexEnd);
    console.log("newPosts here:", newPosts);
    if (newPosts.length === 0) {
      await addViews();
      setNoMorePosts(true);
    } else {
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      await addViews();
      setCurPostIteration(newPosts);
      setSeenPostIndexStart(newSeenPostIndexStart);
      setSeenPostIndexEnd(newSeenPostIndexEnd);
    }
    setIsFetching(false);
  };

  // Debounce function to prevent too many scroll events
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  if (!user) {
    return (
      <Loading />
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col pt-16">

      {/* Top Bar */}
      <div className="w-full flex items-center justify-center space-x-16 mt-4 mb-4 pt-3">
        <TopHomeBar user={user} />
      </div>

      {/* For the three split pages */}
      <div className="w-full h-full flex space-x-5">

        {/* For the left page */}
        <div className="mt-5 w-3/5">
          <LeftHomePage user={user}/>
        </div>

        {/* For the middle page */}
        <div className="w-full h-full mb-10">
          {(posts && posts.length && curPostIteration.length) ? posts.map(p => (
              <PostCard p={p} curUser={user}/>
            )) :
              <div className="flex flex-col justify-center items-center mt-10 space-y-4">
                  <FaSpinner className="animate-spin text-4xl text-blue-400" />
                  <span className="text-lg font-semibold text-gray-700">Loading Posts...</span>
              </div>
            }
            {isFetching && 
              <div className="flex flex-col justify-center items-center mt-10 space-y-4">
                <FaSpinner className="animate-spin text-4xl text-blue-400" />
                <span className="text-lg font-semibold text-gray-700">Loading Posts...</span>
              </div>}
            {noMorePosts &&
              <div>
                <span className="flex flex-col justify-center items-center mt-5 text-base font-semibold text-gray-400">No more posts to show.</span>
              </div>
            }
        </div>

        {/* For the right page */}
        <div className="mt-5 w-3/5">
          <RightHomePage user={user} posts={posts} setPosts={setPosts} />
        </div>
      </div>
    </div>
  )
}

export default HomePage