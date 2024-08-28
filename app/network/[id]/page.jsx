'use client'

import Loading from "@components/Loading";
import NetworkPage from "@components/NetworkPage"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Network = ({ params }) => {

  const { id } = params;
  const { data: session } = useSession();
  const router = useRouter();
  const [checkedUsersConnection, setCheckedUsersConnection] = useState(false);

  // Check if the user is connected to the session user
  // If not, redirect to the session user's network page
  useEffect(() => {

    const checkUsersConnection = async () => {
      const res = await fetch(`/api/connections/are-connected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id1: session?.user.id, id2: id })
      })
      
      if (res.ok) {
        const data = await res.json();
        if (data.message === "connection does not exist") {
          router.push(`/network/${session.user.id}`); // Redirect to the session user's network page
        } else {
          setCheckedUsersConnection(true);
        }
      }
    }

    if (session) {
      if (session.user.id !== id) {
        checkUsersConnection()
      } else {
        setCheckedUsersConnection(true);
      }
    }
  }, [session]);

  if (!session) {
    return (
      <Loading />
    );
  }
  else if (session.user.id !== id && checkedUsersConnection === false) {
    return (
      <Loading />
    );
  }



  return (
    <NetworkPage userId={id}/>
  )
}

export default Network