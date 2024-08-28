'use client'

import ChangePassword from "@components/ChangePassword"
import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@components/Loading";

const PasswordChange = ({ params }) => {

    const { id } = params;

    // State variables to store the error message, user data and session data
    const { data: session } = useSession();
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (session) {
            console.log("session.user.id: ", session.user.id);
            if (session.user.id !== id && !session.user.admin) {
                router.push(`/change_password/${session.user.id}`);
            }
        }
    }, [session]);

    // Fetch the user's profile data
    useEffect(() => {
        const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/profile/${id}`, {cache: "no-store"});
            if (!res.ok) {
            throw new Error('Failed to fetch user data');
            }
            const data = await res.json();
            setUser(data.user);
        } catch (error) {
            setError(error.message);
        }
        };
        
        if (id) {
            fetchProfile();
        }
    }, [id]);   // Dependency array with userId to re-run if userId changes
    
    if (!user) {
        return (
            <Loading />
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <ChangePassword user={ user }/>
    )
}

export default PasswordChange