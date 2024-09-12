'use client'

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';


const ChangePassword = ({ user }) => {

  const [error, setError] = useState("");
  const router = useRouter();
  const [newPassword, setNewPassword] = useState(user?.password);
  const [newConfirmPassword, setNewConfirmPassword] = useState(user?.password);
  const { data: session } = useSession();

  // Function to handle the form submission
  const handleSubmit = async (e) => {

    // Prevents the page from refreshing
    e.preventDefault();
  
    // Check if a password is entered and if it matches the confirm password
    if (newPassword || newConfirmPassword) {
      if (newPassword !== newConfirmPassword) { 
        setError("Passwords do not match");
        return;
      }
    }

    try {
      // Fetch request to update the user's password
      const res = await fetch(`/api/password/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({newPassword})
      });

      if (!res.ok) {
        throw new Error("Failed to update user password");
      }
      else {
        // Redirect to the home page
        if (session?.user.admin) {
          router.push("/home_admin");
        } else {
          router.push("/home");
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="grid place-items-center h-screen">
        <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
            <h1 className="text-xl font-bold my-4">
                <span className="text-3xl">Change your password</span>
                <br />
                <span className="text-gray-400 font-normal text-base">* Change only the fields you want to update</span>
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input onChange={e => setNewPassword(e.target.value)} type="password" placeholder="New Password" />
                <input onChange={e => setNewConfirmPassword(e.target.value)} type="password" placeholder="Confirm New Password" />
                

                <button className="bg-green-400 text-white border border-green-400 hover:bg-white hover:text-green-400 font-bold cursor-pointer px-6 py-2">
                    Update Password
                </button>

                { error && (
                    <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                        {error}
                    </div>
                )}

                {session?.user?.admin ? (
                  <Link className="text-sm mt-3 text-right" href={'/home_admin'}>
                    Don't want to change their password? <span className="underline">Management Page</span>
                  </Link>
                ) : (
                  <Link className="text-sm mt-3 text-right" href={'/home'}>
                    Don't want to change your password? <span className="underline">Home</span>
                  </Link>
                )}
            </form>
        </div>
    </div>
  )
}

export default ChangePassword