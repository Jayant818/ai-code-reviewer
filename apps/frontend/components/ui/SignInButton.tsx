import { useSession } from '@/lib/hooks';
import Link from 'next/link';
import React from 'react'

const SignInButton = () => {
    const { session } = useSession(); 
    return (
      <>
        {
            !session || session.user.id === null ?
                <>
                    <Link
                        href="http://localhost:3001/auth/github/login"
                        className="fire-gradient text-white px-4 py-2 rounded-lg font-medium"
                    >
                    Log In
                    </Link>    
                </> :
                <>
                        
                        
                    <Link
                        href="/api/auth/logout"
                        className="fire-gradient text-white px-4 py-2 rounded-lg font-medium"
                    >
                    Log Out
                    </Link>         
                </>    
        }
      </>
  )
}

export default SignInButton