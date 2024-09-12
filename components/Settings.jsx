"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { HiOutlinePhotograph, HiX } from 'react-icons/hi';

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

const SettingsPage = ({ user }) => {

  const [error, setError] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  const [newName, setNewName] = useState(user?.name);
  const [newSurname, setNewSurname] = useState(user?.surname);
  const [newEmail, setNewEmail] = useState(user?.email);
  const [newPhoneNumber, setNewPhoneNumber] = useState(user?.phone_number);
  const [newPath, setNewPath] = useState(user?.path);
  const [newFile, setNewFile] = useState(null);
  const [imgMessage, setImgMessage] = useState('Update Image');
  const fileInputRef = useRef(null);

  // Function to open the file input dialog when the image icon is clicked
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (event) => {
    setNewFile(event.target.files[0]);
    setImgMessage('Change selected image');
    if (newFile) {
      console.log("Selected file:", newFile);
    }
  };

  // Function to handle the form submission
  const handleSubmit = async (e) => {

    // Prevents the page from refreshing
    e.preventDefault();

    try {
      
      if (newEmail != user.email) {
        
        // Fetch request to check if the user already exists
        const resUserExists = await fetch("/api/userExists", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: newEmail })
        });
  
        const {user} = await resUserExists.json();
  
        if (user) {
            setError("User already exists");
            return;
        }
      }

      // Check if the user updated the image
      if (newFile) {

        // delete old image
        deleteImage(user._id, user.path);
  
        // upload new image
        const formData = new FormData();
        formData.set("file", newFile);
        
        const resImage = await fetch(`/api/files/${session?.user.id}`, {
            method: "POST",
            body: formData
        });
        
        if (!resImage.ok) {
            console.log("Image upload failed");
        }
        
        const newName = session?.user.id + "_" + newFile.name;
        const path = `/assets/logo_images/${newName}`; // the path of the image saved in the server with its unique name
        setNewPath(path);
      }
      else {
        updateProfile();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateProfile = async () => {
    try {
      // Fetch request to update the user's profile
      const res = await fetch(`/api/profile/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({newName, newSurname, newEmail, newPhoneNumber, newPath, newPostCounter: user.post_counter})
      });

      if (!res.ok) {
        throw new Error("Failed to update user data");
      }
      else {
        // Redirect to the home
        if (!session?.user.admin) {
          router.push('/home');
        } else {
          router.push('/home_admin');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (newFile) {
      updateProfile();
    }
  }, [newName, newSurname, newEmail, newPhoneNumber, newPath]);

  return (
    <div className="grid place-items-center h-screen">
        <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
            <h1 className="text-xl font-bold my-4">
                <span className="text-3xl">Settings</span>
                <br />
                <span className="text-gray-400 font-normal text-base">* Change only the fields you want to update</span>
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input onChange={e => setNewName(e.target.value)} value={newName} type="text" placeholder={user?.name} />
                <input onChange={e => setNewSurname(e.target.value)} value={newSurname} type="text" placeholder={user?.surname} />
                <input onChange={e => setNewEmail(e.target.value)} value={newEmail} type="text" placeholder={user?.email} />
                <input onChange={e => setNewPhoneNumber(e.target.value)} value={newPhoneNumber} type="text" placeholder={user?.phone_number} />
                
                <div>
                  {!newFile && (
                    <>
                      <button type="button"
                              onClick={handleClick}
                              className="flex items-center px-2 py-2 text-gray-400 font-bold">
                                <HiOutlinePhotograph className="mr-2 text-lg" />
                                {imgMessage}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }} // Hide the file input
                      />
                    </>
                  )}
                  {newFile && (
                    <button type="button"
                      onClick={() => {
                        setNewFile(null);
                        setImgMessage('Add Image');
                      }}
                      className="flex items-center px-2 py-2 text-red-500 font-bold"
                    >
                      <HiX className="mr-2 text-lg" />
                      Remove Image
                    </button>
                  )}
                </div>

                <button className="bg-green-400 text-white border border-green-400 hover:bg-white hover:text-green-400 font-bold cursor-pointer px-6 py-2">
                    Update Profile
                </button>

                { error && (
                    <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                        {error}
                    </div>
                )}

                
                {session?.user?.admin ? (
                  <Link className="text-sm mt-3 text-right" href={`/change_password/${user._id}`}>
                    You want to change their password? <span className="underline">Change their password</span>
                  </Link>
                ) : (
                  <Link className="text-sm mt-3 text-right" href={`/change_password/${user._id}`}>
                    You want to change your password? <span className="underline">Change your password</span>
                  </Link>
                )}
            </form>
        </div>
    </div>
  )
}

export default SettingsPage