import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "../utils/api";

const Home: NextPage = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [tutorial, setTutorial] = useState("");

  const generateTutorial = api.tutorial.generate.useMutation({
    onSuccess: (data) => {
      setTutorial(data.tutorial);
    },
    onError: (error) => {
      console.error("Error generating tutorial:", error);
      setTutorial("Error generating tutorial. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateTutorial.mutate({ url: githubUrl });
  };

  return (
    <>
      <Head>
        <title>Tutorial Maker</title>
        <meta name="description" content="Generate tutorials from GitHub repositories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Tutorial <span className="text-[hsl(280,100%,70%)]">Maker</span>
          </h1>
          <p className="text-2xl text-white">
            Generate tutorials from GitHub repositories
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="Enter GitHub repository URL"
              className="w-full max-w-md px-4 py-2 text-black rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[hsl(280,100%,70%)] text-white rounded hover:bg-[hsl(280,100%,60%)]"
              disabled={generateTutorial.isLoading}
            >
              {generateTutorial.isLoading ? "Generating..." : "Generate Tutorial"}
            </button>
          </form>
          {tutorial && (
            <div className="mt-8 p-4 bg-white/10 rounded-lg max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Generated Tutorial</h2>
              <pre className="whitespace-pre-wrap text-white">{tutorial}</pre>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
