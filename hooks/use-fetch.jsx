
import { useState } from "react"
import { toast } from "sonner";


const useFetch = (cb) =>{
    const [data,setData] = useState(undefined);
    const [loading,setLoading] = useState(null);
    const [errors,setErrors] = useState(null);

    const fn = async(...args)=>{
        setLoading(true);
        setErrors(null);
        try {
            const response = await cb(...args);
            setData(response);
            setErrors(null)

        } catch (error) {
            setErrors(error)
            throw new Error(error.message)
            toast.error(error.message)
        }finally{
            setLoading(false)
        }
    }
    return {data,loading,errors,fn}
}

export default useFetch;