import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Octokit } from "@octokit/rest";
import type { components } from "@octokit/openapi-types";
import OpenAI from "openai";
import { env } from "~/env.js";
import { TRPCError } from "@trpc/server";

if (!env.GITHUB_ACCESS_TOKEN) {
  throw new Error("GITHUB_ACCESS_TOKEN is not set in the environment variables");
}

if (!env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the environment variables");
}

const octokit = new Octokit({
  auth: env.GITHUB_ACCESS_TOKEN,
});

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const tutorialRouter = createTRPCRouter({
  generate: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      try {
        // Extract owner and repo from the GitHub URL
        const match = input.url.match(/github\.com\/([^/]+)\/([^/]+)/) as RegExpMatchArray;
        if (!match) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid GitHub URL",
          });
        }
        const [, owner, repo] = match as [string, string, string];

        // Fetch repository contents
        const { data: repoContents } = await octokit.repos.getContent({
          owner: owner as string,
          repo: repo as string,
          path: "",
        }) as { data: components["schemas"]["content-directory"] };

        if (!Array.isArray(repoContents)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to fetch repository contents",
          });
        }

        // Fetch README content
        const readmeFile = repoContents.find((file) =>
          file.name.toLowerCase().includes("readme")
        );

        let readmeContent = "";
        if (readmeFile && readmeFile.type === "file") {
          const { data: readmeData } = await octokit.repos.getContent({
            owner: owner as string,
            repo: repo as string,
            path: readmeFile.path,
          }) as { data: components["schemas"]["content-file"] };

          if ('content' in readmeData && typeof readmeData.content === 'string') {
            readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
          } else {
            console.warn("README content not found or in unexpected format");
          }
        }

        // Generate file structure
        const fileStructure = repoContents
          .map((file) => `${file.type === "dir" ? "📁" : "📄"} ${file.name}`)
          .join("\n");

        // Generate tutorial using OpenAI GPT-3.5
        const prompt = `
          Generate a tutorial for the following GitHub repository:

          Repository: ${owner}/${repo}

          README content:
          ${readmeContent}

          File structure:
          ${fileStructure}

          Please create a comprehensive tutorial that explains the purpose of the repository, its main features, and how to use it. Include code examples and explanations where appropriate.
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2000,
          temperature: 0.7,
        });

        const tutorial = response.choices[0]?.message.content?.trim();
        if (!tutorial) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate tutorial",
          });
        }

        return { tutorial };
      } catch (error) {
        console.error("Error in generate mutation:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      }
    }),
});