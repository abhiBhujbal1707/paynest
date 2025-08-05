"use client"
import React, { useEffect } from 'react'
import { useRef } from 'react'
import useFetch from '../../../../../hooks/use-fetch'
import { scanRecipt } from '../../../../../actions/transaction'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
const ReciptScanner = ({ onScanComplete }) => {
    const fileInputRef = useRef()
    const {
        loading: scanReceiptLoading,
        fn: scanReciptFn,
        data: scannedData
    } = useFetch(scanRecipt)

    const handleReciptScan = async(file) => {
        if(file.size > 10*1024*1024){
            toast.error("File size is more than 5 MB")
            return
        }
        await scanReciptFn(file)
    }

    useEffect(() => {
      if(scannedData && !scanReceiptLoading){
        onScanComplete(scannedData);
        toast.success("Recipt Scanned Successfully")
      }

    }, [scanReceiptLoading,scannedData])
    

    return (

        <div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReciptScan(file);
                }}
            />
            <Button
                type="button"
                variant="outline"
                className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanReceiptLoading}
            >
                {scanReceiptLoading ? (
                    <>
                        <Loader2 className="mr-2 animate-spin" />
                        <span>Scanning Receipt...</span>
                    </>
                ) : (
                    <>
                        <Camera className="mr-2" />
                        <span>Scan Receipt with AI</span>
                    </>
                )}
            </Button>

        </div >
    )
}

export default ReciptScanner
