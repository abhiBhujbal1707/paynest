import React, { Suspense } from 'react'
import DashboardPage from './page'

import {BarLoader} from "react-spinners"
const DashboardLayout = () => {
    return (
        <div className='px-5'>

            <h1 className='text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-[60px] font-bold text-gray-600
'>DashBoard</h1>
            <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea' />}>

            <DashboardPage />
            </Suspense>

        </div>
    )
}

export default DashboardLayout
