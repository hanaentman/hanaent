import Link from 'next/link';
import { notFound } from 'next/navigation';

const categories = [
  { slug: 'still-life', name: 'Still Life' },
  { slug: 'landscape', name: 'Landscape' },
  { slug: 'street', name: 'Street' },
  { slug: 'portrait', name: 'Portrait' },
  { slug: 'abstract', name: 'Abstract' },
  { slug: 'conceptual', name: 'Conceptual' },
  { slug: 'documentary', name: 'Documentary' },
];

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const selected = categories.find((item) => item.slug === category);

  if (!selected) notFound();

  return (
    <section className="mx-auto min-h-[calc(100vh-130px)] w-full max-w-6xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between gap-4">
        <h1 className="text-2xl uppercase tracking-[0.25em] text-white">{selected.name}</h1>
        <Link href="/gallery" className="text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-white">Back to Gallery</Link>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {Array.from({ length: 50 }).map((_, index) => (
          <div key={index} className="flex h-44 w-44 flex-col items-center justify-center border border-dashed border-white/30 bg-zinc-900 p-3 text-center">
            <span className="mb-2 text-xs text-gray-500">Image {index + 1}</span>
            <label className="cursor-pointer text-[11px] uppercase tracking-[0.14em] text-gray-300 hover:text-white">
              Upload
              <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
