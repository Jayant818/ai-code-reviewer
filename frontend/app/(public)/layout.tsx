import { Navbar } from "@/components/shared"
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
