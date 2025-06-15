export function Footer() {
  return (
    <footer className="w-full py-6 flex flex-col items-center justify-center bg-gray-100 text-gray-600 text-sm">
      <p>© {new Date().getFullYear()} BugCatcher. All rights reserved.</p>
    </footer>
  );
}
