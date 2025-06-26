import { Navbar } from "@/components/shared"
import ErrorWrapper from "@/components/shared/ErrorWrapper"
export default function NavbarLayout  ({
    children
}: {
    children: React.ReactNode
}) {
  return (
    <main>
        <Navbar />
      <ErrorWrapper>
      {children}  
      </ErrorWrapper>
    </main>
  )
}
