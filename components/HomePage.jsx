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

const HomePage = () => {

  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([-1]);
  const [error, setError] = useState(null);
  const [allPostsFetched, setAllPostsFetched] = useState(false);
  const [current_post_counter, setCurrentPostCounter] = useState(0);
  const postsPerIteration = 4;
  const [seenPostIndexStart, setSeenPostIndexStart] = useState(0);
  const [seenPostIndexEnd, setSeenPostIndexEnd] = useState(postsPerIteration);
  const [isFetching, setIsFetching] = useState(false);


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

    // Fetch all the posts from the current user, the user's connections and the posts
    // the connections have liked or commented on
    
    const getPostsOld = async () => {
      try {
          let tempPosts = [];

          // Get the user's posts
          const res = await fetch(`/api/post?id=${session?.user.id}`);
          if (!res.ok) {
              throw new Error('Failed to fetch posts');
          }
          const data = await res.json();
          tempPosts = data.posts;

          // Get the user's connections
          const res1 = await fetch(`/api/connections/get-all-connections/${session?.user.id}`);
          if (!res1.ok) {
              throw new Error('Failed to fetch connections');
          }
          const data1 = await res1.json();

          // Get all the posts from every connection of the user
          for (const con of data1.data) {
              const res2 = await fetch(`/api/post?id=${con._id}`);
              if (!res2.ok) {
                  throw new Error('Failed to fetch posts');
              }
              const data2 = await res2.json();
              const connectionPosts = data2.posts;

              // Update the tempPosts with the new posts if they don't already exist
              const existingPostIds = new Set(tempPosts.map(post => post._id));
              const newPosts = connectionPosts.filter(post => !existingPostIds.has(post._id));
              tempPosts = [...tempPosts, ...newPosts];

              // Get all the posts that the connections have liked or commented on
              if (con.interactedWithPosts.length !== 0) {
                  for (const postId of con.interactedWithPosts) {
                      const res3 = await fetch(`/api/post/${postId}`);
                      if (!res3.ok) {
                          throw new Error('Failed to fetch post');
                      }
                      const data3 = await res3.json();
                      const tempPost = data3.post;

                      // Update the tempPosts with the new post if it doesn't already exist
                      if (!existingPostIds.has(tempPost._id)) {
                          tempPosts = [...tempPosts, tempPost];
                      }
                  }
              }
          }

          // Set the posts state once at the end and remove potential duplicates
          const uniquePosts = Array.from(new Map(tempPosts.map(post => [post._id, post])).values());
          setPosts(uniquePosts);
      } catch (error) {
          console.error('Error fetching posts:', error);
      }
    };
    
    // Fetch initial posts
    const getPosts = async () => {
      const posts = await selectPosts(session?.user.id, seenPostIndexStart, seenPostIndexEnd);

      console.log("posts here 123: ", posts);

      setPosts(posts);
    };

    if (session?.user.id) {
      fetchProfile();
      getPosts();
      // getPostsNew(); // TODO: replace with getPosts() when finished
    }
  }, [session?.user.id, current_post_counter]);   // Dependency array with userId to re-run if userId changes
  
  useEffect(() => {
    if (posts.length !== 1 || posts[0] !== -1) {
      setAllPostsFetched(true);
    }
  }, [posts]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadMorePosts(); // Call your function when user reaches bottom
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [posts]);

  const loadMorePosts = async () => {
    if (isFetching) return; // Prevent multiple fetches
    setIsFetching(true);

    const newSeenPostIndexStart = seenPostIndexEnd;
    const newSeenPostIndexEnd = seenPostIndexEnd + postsPerIteration;

    const newPosts = await selectPosts(session?.user.id, newSeenPostIndexStart, newSeenPostIndexEnd);

    if (newPosts.length === 0) {
      setIsFetching(false);
      return; // No more posts to fetch
    }

    setPosts(prevPosts => [...prevPosts, ...newPosts]);
    setSeenPostIndexStart(newSeenPostIndexStart);
    setSeenPostIndexEnd(newSeenPostIndexEnd);
    setIsFetching(false);
  };


  if (!allPostsFetched || !user) {
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
        <div className="w-full h-full">
        {posts && posts
          // .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort posts by date (latest first)
          .map(p => (
            <PostCard p={p} curUser={user}/>    // Mh to peirakseis // key={p._id} //
          ))}
        {isFetching && <Loading />} {/* Show loading indicator while fetching */}
        </div>

        {/* For the right page */}
        <div className="mt-5 w-3/5">
          <RightHomePage user={user} current_post_counter={current_post_counter} setCurrentPostCounter={setCurrentPostCounter} />
        </div>

      </div>
      
    </div>
  )
}

export default HomePage