"use client";
import Link from "next/link";
import { IoIosLink } from "react-icons/io";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50  p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl w-full text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered Code Guardian
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            BugCatcher is an AI-powered code reviewer that automatically catches bugs and suggests improvements on every GitHub pull request.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition text-lg"
              href="/connect-github"
            >
              Connect GitHub
            </Link>
            <Link
              className="flex gap-2 items-center px-6 py-3 border border-gray-300 text-gray-800 rounded-xl hover:bg-gray-100 transition text-lg"
              href="/try"
            >
              Try It <IoIosLink />
            </Link>
          </div>
        </motion.div>
      </main>
    </>
  );
}