import Content from "@components/content";
import { NavLink } from "@components/reuse";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alexander Ng | GitHub Discord Webhook",
  description:
    "A self-hosted service that forwards GitHub webhook events to Discord channels with beautifully formatted embeds.",
};

export default function GithubDiscordWebhook() {
  return (
    <Content>
      <div className="flex justify-center">
        <h1 className="text-3xl">GitHub Discord Webhook</h1>
      </div>
      <p className="mt-4">
        A self-hosted service that forwards GitHub webhook events to Discord
        channels with beautifully formatted embeds. Supports multi-user,
        multi-repo configurations with secure webhook signature verification.
      </p>
      <h2 className="text-2xl mt-4">Features</h2>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>
          <strong>Secure by design</strong> - GitHub webhook signature
          verification (HMAC-SHA256)
        </li>
        <li>
          <strong>Multi-user support</strong> - Each user manages their own
          webhook mappings
        </li>
        <li>
          <strong>Flexible registration</strong> - Open, closed, or invite-only
          modes
        </li>
        <li>
          <strong>Beautiful Discord embeds</strong> - Rich formatting for PR
          events
        </li>
        <li>
          <strong>Easy deployment</strong> - Single binary, auto-migrations,
          Railway-ready
        </li>
      </ul>
      <h2 className="text-2xl mt-4">How It Works</h2>
      <pre className="bg-gray-800 text-white p-2 rounded-md my-2 overflow-x-auto text-sm">
        GitHub Repo -&gt; GitHub Webhook -&gt; This Service -&gt; Discord
        Webhook -&gt; Discord Channel
      </pre>
      <p className="mt-2">
        Users create webhook mappings (repo -&gt; Discord webhook), configure
        the generated URL in their GitHub repository settings, and GitHub events
        are automatically forwarded as formatted Discord embeds.
      </p>
      <h2 className="text-2xl mt-4">Quick Start</h2>
      <pre className="bg-gray-800 text-white p-2 rounded-md my-2 overflow-x-auto text-sm">
        {`git clone https://github.com/alexng353/github-discord-webhook.git 
cd github-discord-webhook
bun install
bun run start`}
      </pre>
      <div className="my-4 flex gap-2 flex-wrap">
        <NavLink href="https://github.com/alexng353/github-discord-webhook">
          Source Code
        </NavLink>
      </div>
    </Content>
  );
}
