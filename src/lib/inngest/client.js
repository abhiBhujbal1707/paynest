import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "paynest", name: "PayNest" });