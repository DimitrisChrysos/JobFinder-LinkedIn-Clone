'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import ListingsMenu from "./ListingsMenu"
import ListingCard from "./ListingCard";
import CreateListing from "./CreateListing";
import { FaSpinner } from "react-icons/fa";
import Loading from "./Loading";
import { selectListings } from "@utils/selectListings";

const ListingsPage = () => {

  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const listingsPerIteration = 5;
  const [seenListingIndexStart, setSeenListingIndexStart] = useState(0);
  const [seenListingIndexEnd, setSeenListingIndexEnd] = useState(listingsPerIteration);
  const [isFetching, setIsFetching] = useState(false);
  const [noMoreListings, setNoMoreListings] = useState(false);
  const [curListingIteration, setCurListingIteration] = useState([]);
  
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
        setListingCounter(data.user.listing_counter);
      } catch (error) {
        setError(error.message);
      }
    };

    // Fetch initial listings
    const getListings = async () => {
      const listings = await selectListings(session?.user.id, seenListingIndexStart, seenListingIndexEnd);
      if (listings.length === 0) {
        setNoMoreListings(true);
        return;
      }
      setListings(listings);
      setCurListingIteration(listings);
    };
    
    if (session?.user.id) {
      fetchProfile();
      getListings();
    }
  }, [session?.user.id]);
  
  // Infinite scroll logic
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (noMoreListings || isFetching) return;

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMoreListings();
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, noMoreListings, seenListingIndexEnd, session?.user.id, curListingIteration]);

  // Add views to the listings
  const addViews = async () => {
    console.log("curListingIteration here:", curListingIteration);
    const listingIds = curListingIteration.map(l => l._id);
    console.log("listingIds here:", listingIds);
    const res = await fetch('/api/listing/views', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ listingIds }),
    });
    if (!res.ok) {
      throw new Error('Failed to add a view to each listing');
    }
  }

  // Load more listings
  const loadMoreListings = async () => {

    setIsFetching(true);
    const newSeenListingIndexStart = seenListingIndexEnd;
    const newSeenListingIndexEnd = seenListingIndexEnd + listingsPerIteration;

    const newListings = await selectListings(session?.user.id, newSeenListingIndexStart, newSeenListingIndexEnd);
    console.log("newListings here:", newListings);
    if (newListings.length === 0) {
      await addViews();
      setNoMoreListings(true);
    } else {
      setListings(prevListings => [...prevListings, ...newListings]);
      await addViews();
      setCurListingIteration(newListings);
      setSeenListingIndexStart(newSeenListingIndexStart);
      setSeenListingIndexEnd(newSeenListingIndexEnd);
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
    <div className="w-full min-h-screen flex flex-col pt-16 mt-5">

      {/* For the three split pages */}
      <div className="w-full h-full flex space-x-5">

        {/* For the left page */}
        <div className="mt-5 w-3/5">
          <ListingsMenu user={user}/>
        </div>

        {/* For the middle page */}
        <div className="w-full h-full mb-10">
        {(listings && listings.length ) ? listings.map(p => (
            <ListingCard p={p} curUser={user}/>
          )) :
          <>
            {!noMoreListings &&
              <Loading />
            }
          </>
          }
          {isFetching && 
            <div className="flex flex-col justify-center items-center mt-10">
              <FaSpinner className="animate-spin text-4xl text-blue-400" />
              <span className="text-lg font-semibold text-gray-700">Loading Listings...</span>
            </div>}
          {noMoreListings &&
            <div>
              <span className="flex flex-col justify-center items-center mt-5 text-base font-semibold text-gray-400">No more listings to show.</span>
            </div>
          }
        </div>

        {/* For the right page */}
        <div className="mt-5 w-3/5">
          <CreateListing user={user} listings={listings} setListings={setListings} />
        </div>
      </div>
    </div>
  )
}

export default ListingsPage