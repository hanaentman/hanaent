import Link from 'next/link';

export default function MainPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-130px)] w-full max-w-6xl flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <h1 className="text-4xl font-semibold uppercase tracking-[0.32em] text-white md:text-6xl">
        Sung Joon Kim
      </h1>

      <Link
        href="/gallery"
        className="group flex h-[52vh] min-h-[380px] w-full max-w-4xl items-center justify-center border border-dashed border-white/40 bg-zinc-900 transition hover:border-white hover:bg-zinc-800"
      >
        <div className="px-6">
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-gray-400">Main Image</p>
          <label className="inline-flex cursor-pointer items-center justify-center border border-white/40 px-5 py-2 text-sm text-gray-200 transition hover:border-white hover:text-white">
            Upload JPEG / PNG
            <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" />
          </label>
          <p className="mt-4 text-xs text-gray-500">Click anywhere to open Gallery</p>
        </div>
      </Link>
    </section>
  );
}
