import { createFileRoute } from "@tanstack/react-router";
import App from "@/brew/App";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <App />;
}
