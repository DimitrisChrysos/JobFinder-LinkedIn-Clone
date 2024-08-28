'use client'

import {SessionProvider} from 'next-auth/react';

// AuthProvider component to wrap the entire application with the SessionProvider
export const AuthProvider = ({children}) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}