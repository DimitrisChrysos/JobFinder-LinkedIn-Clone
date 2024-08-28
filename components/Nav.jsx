'use client'

import Image from "next/image"
import Link from "next/link"
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
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
  }, [session?.user?.id]);   // Dependency array with userId to re-run if userId changes
  
  if (error) {
      return <div>Error: {error}</div>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  }

  return (
    
    // Navigation bar
    <nav className='fixed top-0 left-0 w-full bg-white z-50 shadow-md flex justify-between items-center px-4 py-3'>

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
      
      {/* If the user is signed in, display the Sign Out and Home buttons
          If the user is not signed in, display the Sign In and Register buttons */}
      {session?.user ? (
        <div className="flex items-center gap-4">
          <button type='button' onClick={handleSignOut} className='blue_btn'>
              Sign Out
          </button>

          {/* If admin user management page else home*/}
          {session?.user?.admin ? (
            <>
              <Link href='/conversations' className='blue_btn'>
                Chats
              </Link>
              <Link href='/home_admin' className='blue_btn'>
                Home
              </Link>
            </>
          ) : (
            <Link href='/home' className='blue_btn'>
              Home
            </Link>
          )}

          {user?.path ? (
            <Link href={`/view_profile/${session.user?.id}`} className='flex gap-2 flex-center'>
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
          ) : (
            <div className="text-xs">Loading<br />Avatar...</div>
          )}
        </div>
        
      ) : (
        <div className="flex gap-4">
          <Link href='/sign-in' className='blue_btn'>
            Sign In
          </Link>

          <Link href='/register' className='blue_btn'>
            Register
          </Link>
        </div>
      )}
    </nav>
  )
}

export default Nav