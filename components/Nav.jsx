'use client'

import Image from "next/image"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Nav = () => {

  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch the user's profile data
  useEffect(() => {
      const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/profile/${session?.user.id}`);
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
  }, [session?.user?.id]);
  
  if (error) {
      return <div>Error: {error}</div>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  }

  return (
    
    // Navigation bar
    <nav className='fixed top-0 left-0 w-full bg-white z-50 shadow-md flex justify-between items-center px-3 py-3'>

      {/* Logo */}
      <Link href={session?.user ? '/home' : '/'} className='flex gap-2 flex-center'>
        <Image
          src='/assets/app_icon/logo.svg'
          alt='logo'
          width={40}
          height={40}
          className='object-contain'
        />
        <p className='max-sm:hidden font-bold text-base text-gray-700 tracking-wide' style={{ lineHeight: '1.0' }}>
          Job
          <br />
          Finder
        </p>
      </Link>
      
      {/* Display the appropriate buttons for the signed-in/signed-out/admin users */}
      {session?.user ? (
        <div className="flex items-center space-x-3">
          <button 
            type='button' 
            onClick={handleSignOut} 
            className='nav_btn'>
              Sign Out
          </button>

          {session?.user?.admin ? (
            <>
              <Link href='/conversations' className='nav_btn'>
                Chats
              </Link>
              <Link href='/home_admin' className='nav_btn'>
                Home
              </Link>
            </>
          ) : (
            <Link href='/home' className='nav_btn'>
              Home
            </Link>
          )}

          {user?.path && (
            <Link href={`/view_profile/${session.user?.id}`} className='flex gap-2 flex-center pl-4'>
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 p-1">
                <Image 
                  src={user?.path}
                  alt='avatar' 
                  layout="fill"
                  objectFit="cover"
                  className='absolute inset-0 w-full h-full'  
                />
              </div>
            </Link>
          )}
        </div>
        
      ) : (
        <div className="flex gap-4">
          <Link href='/sign-in' className='nav_btn'>
            Sign In
          </Link>

          <Link href='/register' className='nav_btn'>
            Register
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Nav