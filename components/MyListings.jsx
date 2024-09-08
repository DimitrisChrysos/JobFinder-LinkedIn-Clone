'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import ListingCard from "./ListingCard";
import Loading from "./Loading";

const MyListings = () => {

  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([-1]);
  const [error, setError] = useState(null);
  const [allListingsFetched, setAllListingsFetched] = useState(false);
  const [current_listing_counter, setCurrentListingCounter] = useState(0);
  
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

    // Fetch all the listings from the current user, the user's connections and the listings
    // the connections have liked or commented on
    const getListings = async () => {
      try {
          let tempListings = [];

          // Get the user's listings
          const res = await fetch(`/api/listing?id=${session?.user.id}`);
          if (!res.ok) {
              throw new Error('Failed to fetch listings');
          }
          const data = await res.json();
          tempListings = data.listings;

          // Set the listings state once at the end and remove potential duplicates
          const uniqueListings = Array.from(new Map(tempListings.map(listing => [listing._id, listing])).values());
          setListings(uniqueListings);
      } catch (error) {
          console.error('Error fetching listings:', error);
      }
  };
    
    if (session?.user.id) {
      fetchProfile();
      getListings();
    }
  }, [session?.user.id, current_listing_counter]);   // Dependency array with userId to re-run if userId changes
  
  useEffect(() => {
    if (listings.length !== 1 || listings[0] !== -1) {
        console.log("allListingsFetched: ", allListingsFetched);
        setAllListingsFetched(true);
    }
  }, [listings]);
  
  

  if (!allListingsFetched || !user) {
    return (
      <Loading />
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col mt-20">
      {/* Here goes the text */}
      <div className="w-full text-md font-semibold text-gray-500 flex justify-center mt-1">
        My Listings
      </div>

      <div className="w-full h-full flex justify-center items-center">
        <div className="w-1/3 h-full">
          {listings && listings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort listings by date (latest first)
            .map(p => (
              <ListingCard p={p} curUser={user} allListingsFetched={allListingsFetched}/>    // Mh to peirakseis // key={p._id} //
            ))}
        </div>
      </div>
    </div>
  )
}

export default MyListings