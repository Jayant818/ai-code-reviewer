"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Triangle } from "react-loader-spinner";
import { useGetReviewMutation } from "@/features/review/useReviewQuery";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import { FaCode, FaRocket, FaLightbulb, FaShieldAlt, FaPlay } from "react-icons/fa";

const DEFAULT_CODE = `import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());
app.use(cors());

// Potential security issue: hardcoded secret
const JWT_SECRET = "my-secret-key";

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Potential bug: no input validation
  if (username && password) {
    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ token });
  } else {
    res.status(400).json({ error: "Invalid credentials" });
  }
});

// Performance issue: no rate limiting
app.get("/users", async (req, res) => {
  // Potential SQL injection vulnerability
  const query = \`SELECT * FROM users WHERE name = '\${req.query.name}'\`;
  // ... database query
  res.json({ users: [] });
});

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
    <main className="h-full bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl floating" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 h-full">
        {/* Header Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="px-6 py-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">AI Code Reviewer</span>
          </h1>
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto mb-8">
            Experience the power of AI-driven code analysis. Paste your code below and get instant feedback on bugs, security issues, and optimization opportunities.
          </p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {[
              { icon: FaCode, label: "Bug Detection" },
              { icon: FaShieldAlt, label: "Security Analysis" },
              { icon: FaRocket, label: "Performance Tips" },
              { icon: FaLightbulb, label: "Best Practices" }
            ].map((feature, index) => (
              <div key={feature.label} className="flex items-center gap-2 glass-card px-4 py-2 rounded-xl">
                <feature.icon className="w-4 h-4 text-gradient" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div> */}

        {/* Main Editor Section */}
        <div className="w-full mx-auto px-1 pb-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Code Editor */}
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative glass-card rounded-2xl border-gradient overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-glass-border">
                <div className="flex items-center gap-3">
                  <FaCode className="w-5 h-5 text-gradient" />
                  <h2 className="text-xl font-bold">Code Editor</h2>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-error rounded-full"></div>
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                </div>
              </div>

              <div className="h-[calc(100%-5rem)] overflow-auto">
                <Editor
                  value={code}
                  onValueChange={setCode}
                  highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
                  padding={24}
                  style={{
                    fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                    fontSize: 14,
                    backgroundColor: 'transparent',
                    minHeight: '100%',
                    color: '#ffffff',
                    lineHeight: '1.6',
                  }}
                  className="editor-container"
                />
              </div>

              <motion.button
                onClick={reviewCode}
                disabled={isReviewLoading}
                className="absolute bottom-6 right-6 z-10 premium-gradient text-white px-8 py-4 rounded-xl font-semibold glow-effect disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlay className="w-4 h-4" />
                {isReviewLoading ? 'Analyzing...' : 'Review Code'}
              </motion.button>
            </motion.section>

            {/* AI Review Panel */}
            <motion.section
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-card rounded-2xl border-gradient overflow-hidden h-full"
            >
              <div className="flex items-center gap-3 p-6 border-b border-glass-border">
                <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
                <h2 className="text-xl font-bold text-gradient">Code Analysis</h2>
              </div>

              <div className="h-[calc(100%-5rem)] overflow-auto p-6">
                {isReviewLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* <div className="w-16 h-16 rounded-2xl animate-spin glow-effect mb-6"> */}
                      <Triangle/>
                    {/* </div> */}
                    <p className="text-foreground-muted text-lg">Analyzing your code...</p>
                    <p className="text-foreground-subtle text-sm mt-2">This may take a few seconds</p>
                  </div>
                ) : (
                  <div className="max-w-none">
                    {reviewData ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="prose prose-invert max-w-none"
                      >
                        <Markdown rehypePlugins={[rehypeHighlight]}>
                          {reviewData.review}
                        </Markdown>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-20 h-20 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 glow-effect">
                          <FaLightbulb className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gradient">Ready for Analysis</h3>
                        <p className="text-foreground-muted mb-6">
                          Click "Review Code" to get AI-powered insights about your code
                        </p>
                        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                          {[
                            "🐛 Bug Detection & Fixes",
                            "🔒 Security Vulnerability Scan",
                            "⚡ Performance Optimization",
                            "✨ Code Quality Improvements"
                          ].map((feature, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index, duration: 0.4 }}
                              className="glass-card p-3 rounded-lg text-left"
                            >
                              <span className="text-sm">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page
