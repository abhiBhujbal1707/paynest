"use client"
import React, { useEffect } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from '@/components/ui/switch';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import useFetch from '../../../../../hooks/use-fetch';
import { updateDefaultAccount } from '../../../../../actions/dashboard';
import { toast } from 'sonner';
const AccountCard = ({account}) => {
    const {name,type,id,balance,isDefault} = account;
    const {
        loading:updateDefaultLoading,
        fn:updateDefaultfn,
        data:updatedAccount,
        error
    } = useFetch(updateDefaultAccount);
    const handleDefaultChange = async(event)=>{
        event.preventDefault();
        if(isDefault){
            toast.warning("You need atleast one default accout");
            return
        }
        await updateDefaultfn(id);
    }
    useEffect(()=>{
        if(updatedAccount?.success){
            toast.success("Default account updated successfully")
        }
    },[updatedAccount,updateDefaultLoading])
    useEffect(()=>{
       if(error){
        toast.error(error.message || "Eror updating account")
       } 
    },[error])
    return (
        <div>
            <Card className="hover:shadow-md transition-shadow group relative">
                <Link href={`/account/${id}`}>                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                    <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>                  
                    <Switch checked={isDefault} onClick={handleDefaultChange} disabled={updateDefaultLoading} />
                </CardHeader>
                <CardContent className="my-2 space-y-1">
                   <div className='text-2xl font-bold'>
                    ${parseFloat(balance).toFixed(2)}
                   </div>
                   <div className='text-xs text-muted-foreground'>
                    {type.charAt(0) +type.slice(1).toLowerCase()} Account
                   </div>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div className='flex items-center'>
                        <ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />Income
                    </div>
                    <div className='flex items-center'>
                        <ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />Expanse
                    </div>
                </CardFooter>
                </Link>
            </Card>
        </div>
    )
}

export default AccountCard
