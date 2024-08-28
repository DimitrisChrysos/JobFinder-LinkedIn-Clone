'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserById } from "@utils/getUserFromID";
import { useSession } from "next-auth/react";
import SettingsPage from "@components/Settings";
import Loading from "@components/Loading";

const Settings = ({ params }) => {
  
  const { id } = params;

  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      if (session.user.id !== id && !session.user.admin) {
          router.push(`/settings/${session.user.id}`);
      }
    }
  }, [session]);

  useEffect(() => {
    const fetchUser = async () => {
      const tempUser = await getUserById(id);
      setUser(tempUser);
    }
    
    if(id) {
      fetchUser();
    }
  }, [id])

  if (!user) {
    return (
      <Loading />
    );
  }
    
  return (
    <SettingsPage user={user} />
  )
}

export default Settings