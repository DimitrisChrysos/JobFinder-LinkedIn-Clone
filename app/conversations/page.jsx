'use client';

import ConversationsPage from "@components/ConversationsPage"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react";
import { getUserById } from "@utils/getUserFromID";
import Loading from "@components/Loading";

const Conversations = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const tempUser = await getUserById(session?.user.id);
      setUser(tempUser);
    }
    
    if(session?.user.id) {
      fetchUser();
    }
  }, [session?.user.id])

  if (!user) {
    return (
      <Loading />
  );
  }

  return (
    <ConversationsPage user={user}/>
  )
}

export default Conversations