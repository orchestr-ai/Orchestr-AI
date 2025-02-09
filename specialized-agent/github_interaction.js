import { Octokit } from "@octokit/rest";
import fs from "fs";

import dotenv from "dotenv";

dotenv.config();

const githubToken = process.env.GITHUB_TOKEN; // TODO : enter your github token here

const octokit = new Octokit({
  auth: githubToken,
});

const path = "index.html";

export const getDetailsFromRepo = async (wallet, args) => {
  const { repo_url } = args;
  const [owner, repo] = repo_url.split("/").slice(-2);
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  const content = Buffer.from(response.data.content, "base64").toString(
    "utf-8"
  );
  const sha = response.data.sha;
  fs.writeFileSync("sha.txt", sha);
  return content;
};

export const updateTitleAndCreatePR = async (wallet, args) => {
  const { repo_url, newContent } = args;
  const [owner, repoName] = repo_url.split("/").slice(-2);
  const baseBranchName = "main";
  const newBranchName = "improve-seo";

  console.log("newContent: ", newContent);

  const updatedContent = newContent;
  const encodedContent = Buffer.from(updatedContent, "utf-8").toString(
    "base64"
  );

  // Create a new branch
  const { data: refData } = await octokit.request(
    "GET /repos/{owner}/{repo}/git/refs/heads/{branch}",
    {
      owner,
      repo: repoName,
      branch: baseBranchName,
    }
  );

  await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner,
    repo: repoName,
    ref: `refs/heads/${newBranchName}`,
    sha: refData.object.sha,
  });

  console.log("New branch created successfully.");

  // Commit the changes to the new branch
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo: repoName,
    path,
    message: "Updated with new SEO in index.html",
    content: encodedContent,
    sha: fs.readFileSync("sha.txt", "utf-8"),
    branch: newBranchName,
  });

  console.log("Changes Commited Successfully");

  // Create a pull request
  await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner,
    repo: repoName,
    title: "Update index.html",
    head: newBranchName,
    base: baseBranchName,
    body: "This PR updates the SEO of a website",
  });

  console.log("Pull request created successfully.");

  return "PR created successfully";
};
