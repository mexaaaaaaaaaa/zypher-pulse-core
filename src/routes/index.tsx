import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZypherMC — Minecraft Network" },
      { name: "description", content: "ZypherMC — AAA Minecraft network with PvP tiers, leaderboards, and live server dashboards." },
      { property: "og:title", content: "ZypherMC" },
      { property: "og:description", content: "AAA Minecraft network." },
      { "http-equiv": "refresh", content: "0; url=/index.html" } as any,
    ],
  }),
  component: Index,
});

function Index() {
  if (typeof window !== "undefined") {
    window.location.replace("/index.html");
  }
  return (
    <div style={{ minHeight: "100vh", background: "#0a0508", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      <a href="/index.html" style={{ color: "#c84fff" }}>Loading ZypherMC…</a>
    </div>
  );
}
