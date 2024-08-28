import Image from "next/image";
import Link from "next/link";
import {  HiOutlineUserCircle } from "react-icons/hi";
import { HiOutlineUserGroup } from "react-icons/hi";

const LeftHomePage = ({ user }) => {
  return (
    <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-400 sticky top-20">
        <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto flex items-center justify-center border-2 border-gray-400 shadow-lg">
            <Image 
                src={user?.path}
                alt="avatar" 
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 w-full h-full" 
            />
        </div>
        <div className="flex justify-center items-center mt-3">
            <span>Welcome {user.name}!</span>
        </div>
        <div className="flex justify-center items-center">
            <hr className="border-t-2 border-gray-300 w-3/4 my-4" />
        </div>
        <Link href={`/view_profile/${user._id}`}>
            <button className="bg-green-400 text-white border border-green-400 w-full font-bold py-1.5 px-5 transition-all hover:bg-white hover:text-green-400 text-center text-sm font-inter flex items-center justify-center gap-2">
                <HiOutlineUserCircle size={24}/>
                <span>Profile</span>
            </button>
        </Link>
        <Link href={`/network/${user._id}`}>
            <button className="bg-blue-400 text-white border border-blue-400 w-full font-bold py-1.5 px-5 mt-3 transition-all hover:bg-white hover:text-blue-400 text-center text-sm font-inter flex items-center justify-center gap-2">
                <HiOutlineUserGroup size={24}/>
                <span>Network</span>
            </button>
        </Link>
    </div>
  )
}

export default LeftHomePage