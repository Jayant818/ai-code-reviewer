import ErrorWrapper from "@/components/shared/ErrorWrapper";

export default function DemoPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-[100vh]">
      <ErrorWrapper>
      {children}
      </ErrorWrapper>
    </main>
  );
}
