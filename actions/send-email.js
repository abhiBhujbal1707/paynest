import { Resend } from "resend";
import { success } from "zod";

export async function sendEmail({to,subject,react}){
    const resend = new Resend(process.env.RESEND_EMAIL_API_KEY)
    console.log("Email api key:",process.env.RESEND_EMAIL_API_KEY)
    try {
        const data = await resend.emails.send({
            from:"Paynest App <onboarding@resend.dev>",
            to,subject,react
        })
        return{success:true,data}
    } catch (error) {
        console.error(error.message)
        return {success:false , error}
    }
}