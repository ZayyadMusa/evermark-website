import type { Metadata } from "next";
export const metadata:Metadata={title:"Evermark",description:"Brand protection, from the first brief to the next decision."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
