import SearchBox from "@/components/searchbox";

export default function Home() {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden pb-10 flex-col">
      <SearchBox initiallyOpen />
    </div>
  );
}
