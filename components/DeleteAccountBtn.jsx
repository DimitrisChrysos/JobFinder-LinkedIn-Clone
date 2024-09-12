'use client';

import { signOut, useSession } from 'next-auth/react';
import { HiOutlineTrash } from 'react-icons/hi';
import { useRouter } from "next/navigation";

const deleteImage = async (id, path) => {
  try {
      const res = await fetch(`/api/files/${id}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, path }),
      });

      if (!res.ok) {
          throw new Error('Failed to delete file');
      }

      const data = await res.json();
      console.log(data.message); // "File deleted."
  } catch (error) {
      console.error('Error:', error.message);
  }
};

const DeleteAccountBtn = ({ user }) => {

  const { data: session } = useSession();
  const router = useRouter();

  // if the user is an admin and tries to delete his/her profile, redirect to view_profile page
  if (session?.user.admin && user._id == session?.user.id) {
    router.push(`/view_profile/${user._id}`);
  }

  // Function to delete the user's account
  const deleteAccount = async () => {

    const confirmDelete = confirm(`Are you sure you want to delete account "${user.name} ${user.surname}"?`);
    if (confirmDelete) {
      
      if (user.path !== "/assets/logo_images/default-avatar-icon.jpg")
        deleteImage(user._id, user.path);

      const res = await fetch(`/api/profile?id=${user._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
          alert('Account deleted successfully');
          if (!session?.user.admin) {
            signOut();  // Sign out the user if not admin
          } else {
            router.push('/home_admin');  // Redirect to admin dashboard
          }
      } else {
          alert('Failed to delete account');
      }
    }
  }

  return (
    <button onClick={deleteAccount} className="flex flex-col items-center text-red-500 transition-transform duration-300 ease-in-out transform hover:scale-110 hover:text-red-500">
      <HiOutlineTrash size={26}/>
      <span className="hidden lg:block">Delete Account</span>
    </button>
  )
}

export default DeleteAccountBtn