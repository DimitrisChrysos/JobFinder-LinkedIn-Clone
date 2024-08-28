'use client'

import PersonalInfoForm from "@components/PersonalinfoForm"
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@components/Loading";


const ProfileInfo = () => {


  // State variables to store the error message, user data and session data
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Fetch the user's profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile_info/${session?.user.id}`, {cache: "no-store"});
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        setError(error.message);
      }
    };
    
    if (session?.user.id) {
      fetchProfile();
    }
  }, [session?.user.id]);   // Dependency array with userId to re-run if userId changes
  
  if (!user) {
    return (
      <Loading />
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {!user?.admin ? (
        <PersonalInfoForm user={user} />
      ) : (
        router.push('/home_admin')
      )}
    </>
  )
}

export default ProfileInfo