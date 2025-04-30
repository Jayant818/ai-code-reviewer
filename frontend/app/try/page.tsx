"use client";
import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
import z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
import { Triangle } from "react-loader-spinner";
import { useGetReviewMutation } from "@/src/hooks/api-hooks/useReviewQuery";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";

const DEFAULT_CODE = `import express from "express";
import cors from "cors";
import AIRoute from "./routes/ai.routes";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/ai", AIRoute);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});`;

const Page = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  // Form validation schema
  // const codeSchema = z.object({
  //   code: z.string().min(2, "Code is required"),
  // });
  
  // type CodeValue = z.infer<typeof codeSchema>;

  // Setup react-hook-form (though we're not actively using it with the Editor)
  // const { handleSubmit } = useForm<CodeValue>({
  //   resolver: zodResolver(codeSchema),
  //   defaultValues: {
  //     code: DEFAULT_CODE,
  //   }
  // });

  // API mutation hook
  const { 
    mutate: getReview, 
    isPending: isReviewLoading, 
    data: reviewData 
  } = useGetReviewMutation({
    customConfig: {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  });

  // Submit handler
  const reviewCode = () => {
    getReview({
      code: code,
      provider: "GEMINI"
    });
  };

  return (
    <main className="w-full h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-2 gap-0 bg-gray-900">
      {/* Left column (code editor) */}
      <section className="relative h-full bg-[#0c0c0c] border-r border-gray-700">
        <div className="h-full overflow-auto p-4">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
            padding={16}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              backgroundColor: 'transparent',
              minHeight: '100%',
            }}
            className="editor-container"
          />
        </div>
        
        <button
          onClick={reviewCode}
          className="absolute bottom-4 right-4 z-10 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          Review Code
        </button>
      </section>
      
      {/* Right column (AI review) */}
      <section className="h-full bg-[#1e1e1e] overflow-auto">
        <div className="p-6 h-full">
          <h1 className="text-2xl font-bold mb-4 text-white">AI Code Review</h1>
          
          {isReviewLoading ? (
            <div className="flex justify-center items-center h-[calc(100%-3rem)]">
              <Triangle
                visible={true}
                height="80"
                width="80"
                color="#3b82f6"
                ariaLabel="loading"
              />
            </div>
          ) : (
            <div className="max-w-none">
              {reviewData ? (
                <Markdown rehypePlugins={[rehypeHighlight]}>
                  {reviewData.review}
                </Markdown>
              ) : (
                <div className="text-gray-400">
                  <p>Submit your code for an AI-powered review.</p>
                  <p className="mt-2">The AI will analyze your code for:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Potential bugs and errors</li>
                    <li>Performance optimizations</li>
                    <li>Security vulnerabilities</li>
                    <li>Code style and best practices</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Page
