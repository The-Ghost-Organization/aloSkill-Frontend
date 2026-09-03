import Image from "next/image";

const PALETTES = [
  "from-orange-200 to-orange-400",
  "from-sky-200 to-sky-400",
  "from-emerald-200 to-emerald-400",
  "from-violet-200 to-violet-400",
  "from-rose-200 to-rose-400",
  "from-amber-200 to-amber-400",
];

function paletteFor(seed: string) {
  const sum = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTES[sum % PALETTES.length];
}

export function BookCover({
  title,
  coverUrl,
  id,
}: {
  title: string;
  coverUrl?: string;
  id: string;
}) {
  if (coverUrl) {
    return (
      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-black/5">
        <Image src={coverUrl} alt={title} fill className="object-cover" sizes="48px" />
      </div>
    );
  }

  const initial = title.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`flex h-16 w-12 shrink-0 items-center justify-center rounded-md bg-linear-to-br shadow-sm ring-1 ring-black/5 ${paletteFor(
        id
      )}`}
    >
      <span className="text-lg font-serif font-semibold text-white/90">{initial}</span>
    </div>
  );
}
