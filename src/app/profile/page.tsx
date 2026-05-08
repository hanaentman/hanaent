export default function ProfilePage() {
  return (
    <section className="mx-auto min-h-[calc(100vh-130px)] w-full max-w-6xl px-6 py-16 text-gray-100">
      <h1 className="mb-6 text-3xl uppercase tracking-[0.28em] text-white">Profile</h1>
      <p className="whitespace-pre-line text-sm leading-7 text-gray-300 md:text-base">
        {`Sung Joon Kim
Fine Art Photographer
Silver Award, Fine Art, 2024 Budapest Foto Awards
Honorable Mention, 2025 International Photography Awards`}
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {['Profile Image', 'Signature Image'].map((title) => (
          <div key={title} className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-white/35 bg-zinc-900 p-6 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-gray-400">{title}</p>
            <label className="cursor-pointer border border-white/40 px-4 py-2 text-sm transition hover:border-white">
              Upload JPEG / PNG
              <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden" />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
