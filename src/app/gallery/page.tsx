import Link from 'next/link';

const categories = ['still-life', 'landscape', 'street', 'portrait', 'abstract', 'conceptual', 'documentary'];

const displayMap: Record<string, string> = {
  'still-life': 'Still Life',
  landscape: 'Landscape',
  street: 'Street',
  portrait: 'Portrait',
  abstract: 'Abstract',
  conceptual: 'Conceptual',
  documentary: 'Documentary',
};

export default function GalleryPage() {
  return (
    <section className="mx-auto min-h-[calc(100vh-130px)] w-full max-w-6xl px-6 py-16">
      <h1 className="mb-10 text-center text-3xl uppercase tracking-[0.28em] text-white">Gallery</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/gallery/${category}`}
            className="border border-white/25 bg-zinc-900 px-6 py-5 text-center text-sm uppercase tracking-[0.2em] text-gray-200 transition hover:border-white hover:text-white"
          >
            {displayMap[category]}
          </Link>
        ))}
      </div>
    </section>
  );
}
