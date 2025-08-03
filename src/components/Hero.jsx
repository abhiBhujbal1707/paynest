"use client";
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { Button } from './ui/button';
const Hero = () => {

    const imgRef = useRef();
    useEffect(() => {
        const imageElement = imgRef.current;
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 100;
            if(scrollPosition>scrollThreshold){
                imageElement.classList.add("scrolled")
            }else{
                imageElement.classList.remove("scrolled")
            }
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll",handleScroll);
    }, [])

    return (
        <div className='pb-20 px-4'>
            <div className='container mx-auto text-center'>
                <h1 className='text-5xl md:text-8xl lg:text-[105px] pb-6 bg-gradient-to-br from-blue-600 to-purple-600 font-extrabold tracking-tight pr-2 pb-2 text-transparent bg-clip-text'>Manage Your Finance <br /> with PayNest</h1>
                <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>An AI-powered financial platform that helps you track,analyze and optimize you spending with real-time insights</p>
                <div>
                    <Link href={'/dashboard'}>
                        <Button size={'lg'} className={"px-8 bg-black text-gray-200 cursor-pointer"}>Get Started</Button>
                    </Link>
                    {/* <Link href={'/dashboard'}>
                        <Button size={'lg'} className={"px-8"}>Get Started</Button>
                    </Link> */}
                </div>
                <div className='hero-image-wrapper'>
                    <div ref={imgRef} className='hero-image'>
                        <Image
                            src={"/banner.jpeg"}
                            alt='PayNest Banner'
                            height={720}
                            width={1280}
                            priority
                            className='rounded-lg shadow-2xl border mx-auto'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
