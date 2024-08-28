"use client"

import Link from "next/link"
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HiOutlinePhotograph, HiX } from 'react-icons/hi';

const RegisterForm = () => {

    // State variables to store the user's name, email, password, and error message
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [file , setFile] = useState(null);
    const [imgMessage, setImgMessage] = useState('Add Image');
    const fileInputRef = useRef(null);

    // Function to open the file input dialog when the camera icon is clicked
    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setImgMessage('Change selected image');
        if (file) {
            console.log("Selected file:", file);
        }
    };

    // Next.js hook to navigate to different pages
    const router = useRouter();

    // Function to handle the form submission
    const handleSubmit = async (e) => {

        // Prevents the page from refreshing
        e.preventDefault();

        // Check if any of the fields are empty
        if (!name || !surname || !email || !phone_number || !password || !confirm_password || !file) {
            setError("Please fill in all fields");
            return;
        }

        if (email === "admin@u.com") {
            setError("User already exists");
            return;
        }

        // Check if the password and confirm password fields match
        if (password !== confirm_password) { 
            setError("Passwords do not match");
            return;
        }

        // Check if the user already exists in the database before registering the user
        try {

            // Fetch request to check if the user already exists
            const resUserExists = await fetch("/api/userExists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const {user} = await resUserExists.json();

            if (user) {
                setError("User already exists");
                return;
            }
            
            // Fetch request to register the user if the user does not exist (checked before)
            const path = `/assets/logo_images/temp`; // temp path of the profile image
            const post_counter = 0;
            const listing_counter = 0;
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name, surname, email, phone_number, password, path, post_counter, listing_counter})
            });
            
            // If the user is successfully registered, save his profile image in the server
            // Also reset the form and navigate to the home page
            if (res.ok) {
                const data = await res.json();
                const user = data.user;
                
                // To save the image in the server
                const formData = new FormData();
                formData.set("file", file);
                
                // Fetch request to save the image in the server
                const resImage = await fetch(`/api/files/${user._id}`, {
                    method: "POST",
                    body: formData
                });
                
                if (!resImage.ok) {
                    console.log("Image upload failed");
                }

                // Update the user with the real path of the image
                const newName = user._id + "_" + file.name;
                const newPath = `/assets/logo_images/${newName}`;
                
                const resUpdatePath = await fetch(`/api/profile/${user._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({newPath: newPath})
                });

                // Reset the form and navigate to the home page
                const form = e.target;
                form.reset();
                router.push("/");
            } else {
                console.log("User registration failed.");
            }
        } catch (error) {
            console.log("An error occurred while registering the user: ", error);
        }
    };


    return (
        <div className="grid place-items-center h-screen mt-5">
            <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-400">
                <h1 className="text-xl font-bold my-4">
                    Register
                </h1>
    
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input onChange={e => setName(e.target.value)} type="text" placeholder="Name" />
                    <input onChange={e => setSurname(e.target.value)} type="text" placeholder="Surname" />
                    <input onChange={e => setEmail(e.target.value)} type="text" placeholder="Email" />
                    <input onChange={e => setPhoneNumber(e.target.value)} type="text" placeholder="Phone Number" />
                    <input onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                    <input onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" />
                    
                    <div className="mb-4">
                        {!file && (
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
                                    accept="image/*" // Only accept image files
                                />
                            </>
                        )}
                        {file && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFile(null);
                                    setImgMessage('Add Image');
                                }}
                                className="flex items-center px-2 py-2 text-red-500 font-bold"
                            >
                                <HiX className="mr-2 text-lg" />
                                Remove Image
                            </button>
                        )}
                    </div>

                    <button className="bg-blue-400 text-white font-bold cursor-pointer px-6 py-2">
                        Register
                    </button>
    
                    { error && (
                        <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                            {error}
                        </div>
                    )}
    
                    <Link className="text-sm mt-3 text-right" href={'/sign-in'}>
                        Already have an account? <span className="text-blue-400 text-base font-semibold">Login</span>
                    </Link>
                </form>
            </div>
        </div>
    )
}

export default RegisterForm