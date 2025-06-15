import { Navbar } from "@/components/shared"
console.log("Navbar Layout ")
export default function NavbarLayout  ({
    children
}: {
    children: React.ReactNode
}) {
  return (
    <main>
        <Navbar />
        {children}  
    </main>
  )
}
