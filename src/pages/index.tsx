import { type NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
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
          {/* Add your GitHub URL input and tutorial rendering logic here */}
        </div>
      </main>
    </>
  );
};

export default Home;
