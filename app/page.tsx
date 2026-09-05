import { Header } from "@/components/sections/header";
import { contact, links } from "@/content/site";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-section px-gutter py-section">
      <Header contact={contact} links={links} />
    </main>
  );
}
