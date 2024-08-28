'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import ListingsMenu from "./ListingsMenu"
import ListingCard from "./ListingCard";
import CreateListing from "./CreateListing";
import { set } from "mongoose";
import { FaSpinner } from "react-icons/fa";
import Loading from "./Loading";

const ListingsPage = () => {

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

          // Get the user's connections
          const res1 = await fetch(`/api/connections/get-all-connections/${session?.user.id}`);
          if (!res1.ok) {
              throw new Error('Failed to fetch connections');
          }
          const data1 = await res1.json();

          // Get all the listings from every connection of the user
          for (const con of data1.data) {
            const res2 = await fetch(`/api/listing?id=${con._id}`);
            if (!res2.ok) {
                throw new Error('Failed to fetch listings');
            }
            const data2 = await res2.json();
            const connectionListings = data2.listings;

            // Update the tempListings with the new listings if they don't already exist
            const existingListingIds = new Set(tempListings.map(listing => listing._id));
            const newListings = connectionListings.filter(listing => !existingListingIds.has(listing._id));
            tempListings = [...tempListings, ...newListings];
          }

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
    <div className="w-full min-h-screen flex flex-col pt-16">

      {/* For the three split pages */}
      <div className="w-full h-full flex space-x-5">

        {/* For the left page */}
        <div className="mt-5 w-3/5">
          <ListingsMenu user={user}/>
        </div>

        {/* For the middle page */}
        <div className="w-full h-full">
        {listings && listings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort listings by date (latest first)
          .map(p => (
            <ListingCard p={p} curUser={user} allListingsFetched={allListingsFetched}/>    // Mh to peirakseis // key={p._id} //
          ))}
        </div>

        {/* For the right page */}
        <div className="mt-5 w-3/5">
          <CreateListing user={user} current_listing_counter={current_listing_counter} setCurrentListingCounter={setCurrentListingCounter} />
        </div>

      </div>
      
    </div>
  )
}

export default ListingsPage