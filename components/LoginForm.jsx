'use client';

import Link from "next/link"
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import InitAdminUser from "./InitAdminUser";

const LoginForm = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the page from refreshing

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (email == "admin@u.com" && password == "admin123") {
            await InitAdminUser();
        }

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (res.error) {
                setError("Invalid Credentials");
                return;
            }

            if (email == "admin@u.com") {
                router.replace('/home_admin');
            }
            else {
                router.replace('/home');
            }
        } catch (error) {
            console.log(error);
        }
    };

  return (
    <div className="grid place-items-center h-screen">
        <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-400">
            <h1 className="text-xl font-bold my-4">
                Login
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input onChange={e => setEmail(e.target.value)} type="text" placeholder="Email" />
                <input onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                <button className="bg-blue-400 text-white font-bold cursor-pointer px-6 py-2">
                    Login
                </button>

                { error && (
                    <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                        {error}
                    </div>
                )}

                <Link className="text-sm mt-3 text-right" href={'/register'}>
                    Don't have an account? <span className="text-blue-400 text-base font-semibold">Register</span>
                </Link>
            </form>
        </div>
    </div>
  )
}

export default LoginForm