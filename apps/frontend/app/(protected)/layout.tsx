import { Navbar } from "@/components/shared"
import { getSession } from "@/lib/session";
import { useRouter } from "next/navigation";
export default async function NavbarLayout  ({
    children
}: {
    children: React.ReactNode
  }) {

  const session = await getSession();
  const isAuthenticated = session?.user?.id;
  

   if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Checking authentication...</h2>
          <div className="fire-gradient w-8 h-8 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <main>
        <Navbar />
        {children}  
    </main>
  )
}
