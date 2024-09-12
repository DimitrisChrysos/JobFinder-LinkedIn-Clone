import Link from "next/link"
import { HiOutlineBell, HiOutlineBriefcase, HiOutlineChat, HiOutlineCog, HiOutlineUserCircle } from "react-icons/hi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { HiOutlineHome } from "react-icons/hi";

const TopHomeBar = ({ user }) => {
  return (
    <div className="shadow-lg p-7 w-full rounded-lg border-t-4 border-blue-400 flex justify-around">
      <Link href='/home' className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
        <HiOutlineHome size={24}/>
        <span className="text-base">Home</span>
      </Link>
      <Link href={`/network/${user._id}`} className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
        <HiOutlineUserGroup size={24}/>
        <span className="text-base ">Network</span>
      </Link>
      <Link href='/listings/' className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
        <HiOutlineBriefcase size={24}/>
        <span className="text-base ">Job Listings</span>
      </Link>
      <Link href={'/conversations/'} className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
        <HiOutlineChat size={24}/>
        <span className="text-base">Chats</span>
      </Link>
      <Link href='/notifications' className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
        <HiOutlineBell size={24}/>
        <span className="text-base">Notifications</span>
      </Link>
      <Link href={`/profile_info`} className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
        <HiOutlineUserCircle size={24}/>
        <span className="text-base">Profile</span>
      </Link>
      <Link href={`/settings/${user._id}`} className='text-blue-400 transition duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center'>
        <HiOutlineCog size={24}/>
        <span className="text-base">Settings</span>
      </Link>
    </div>
  )
}

export default TopHomeBar