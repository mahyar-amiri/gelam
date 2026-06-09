// "use client";

// import dynamic from "next/dynamic";
// import { BoxSelect } from "lucide-react";

// // Dynamically import the 3D scene to disable Server-Side Rendering
// const DynamicScene = dynamic(() => import("./components/SceneViewer"), {
//   ssr: false,
//   loading: () => (
//     <div className="flex h-full w-full items-center justify-center bg-slate-50">
//       <p className="text-slate-500 animate-pulse">Loading 3D Experience...</p>
//     </div>
//   ),
// });

// export default function Home() {
//   return (
//     <main className="relative h-screen w-full bg-slate-100">
//       {/* 3D Canvas Layer */}
//       <div className="absolute inset-0">
//         <DynamicScene />
//       </div>

//       {/* Floating UI Layer */}
//       <div className="absolute top-8 left-8 z-10 p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200">
//         <h1 className="text-2xl font-bold text-slate-800 mb-2">
//           Interactive Viewer
//         </h1>
//         <p className="text-slate-600 mb-4">Drag to rotate. Scroll to zoom.</p>
//         <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
//           <BoxSelect size={18} />
//           <span>View Details</span>
//         </button>
//       </div>
//     </main>
//   );
// }

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
