'use client'

import Loading from "@components/Loading";
import ProfileView from "@components/ProfileView";
import { useSession } from "next-auth/react";

const ViewProfile = ({ params }) => {
  const { id } = params;
  const { data: session } = useSession();

  if (!session) {
    return (
      <Loading />
    );
  }

  return (
    <ProfileView userId={id} />
  )
}
  
export default ViewProfile