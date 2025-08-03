import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'
import { Button } from './ui/button'
import { LayoutDashboard, PenBox } from 'lucide-react'
import { checkUser } from '@/lib/checkUser'


const Header = async () => {
    await checkUser();
    return (
        <div className='container fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b py-2'>

            <nav className='container mx-auto px-2 sm:px-4 flex items-center justify-between sm:justify-between gap-2 sm:gap-0 h-16'>

                <Link href="/">
                    <Image
                        src={"/logo.png"}
                        alt='PayNest Logo'
                        height={60}
                        width={200}
                        className='h-20 w-auto object-contain' />
                </Link>
                <div className='flex items-center space-x-4 '>
                    <SignedIn>
                        <Link
                            href={'/dashboard'}
                            className='text-gray-600 hover:text-blue-600 flex items-center gap-2'
                        >
                            <Button variant="outline" className="cursor-pointer" >
                                <LayoutDashboard size={18} />
                                <span className='hidden md:inline'>Dashboard</span>
                            </Button>
                        </Link>
                        <Link href={'/transaction/create'}>
                            <Button className="cursor-pointer flex text-gray-200 gap-2 bg-black">
                                <PenBox size={18} />
                                <span className='hidden md:inline'>Add Transaction</span>
                            </Button>
                        </Link>
                    </SignedIn>

                    <SignedOut>
                        <SignInButton forceRedirectUrl='/dashboard'>
                            <Button variant="outline" className="cursor-pointer">Log In</Button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex items-center justify-center">
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9", // aligned with button size
                                    },
                                }}
                            />
                        </div>
                    </SignedIn>
                </div>

            </nav>
        </div>
    )
}

export default Header
