import ModelViewer from "@/components/ModelViewer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
            Interactive 3D experience
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            Show your product with a fully interactive 3D model
          </h1>
          <p className="max-w-xl text-base leading-8 text-zinc-300">
            Rotate, zoom, and inspect the model directly in the browser.
          </p>
        </div>

        <ModelViewer />
      </section>
    </main>
  );
}
