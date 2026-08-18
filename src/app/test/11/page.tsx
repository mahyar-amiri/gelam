import ModelViewerSettings from "@/components/ModelViewer";

export default function Home() {
  return (
    <main className="relative text-white">
      {/* The 3D model stays fixed in the background */}
      <ModelViewerSettings />

      {/* Give the page height so the user can scroll, driving the animation */}
      <div className="h-[300vh] pointer-events-none hidden">
        {/* Section 1 */}
        <section className="flex min-h-screen items-start justify-center p-6">
          <div className="pointer-events-auto space-y-6 rounded-3xl bg-zinc-950/40 p-10 text-center backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
              Interactive Scroll Experience
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              Scroll down to inspect
            </h1>
            <p className="mx-auto max-w-xl text-base leading-8 text-zinc-300">
              The model rotates dynamically on both the X and Y axes as you
              scroll down the page.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="flex min-h-screen items-center justify-center p-6">
          <div className="pointer-events-auto space-y-4 rounded-3xl bg-zinc-950/40 p-10 text-center backdrop-blur-md">
            <h2 className="text-3xl font-bold">Keep Scrolling</h2>
            <p className="text-zinc-300">Notice the continuous rotation...</p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="flex min-h-screen items-end justify-center p-6">
          <div className="pointer-events-auto space-y-4 rounded-3xl bg-zinc-950/40 p-10 text-center backdrop-blur-md">
            <h2 className="text-3xl font-bold">Full 360° View</h2>
            <p className="text-zinc-300">You have reached the bottom.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
