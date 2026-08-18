"use client";

// Define the properties for our floating elements
interface FloatingElement {
  id: number;
  imageUrl: string;
  size: string;
  position: string;
  animationClass: string;
  hoverClass: string;
}

const floatingElements: FloatingElement[] = [
  {
    id: 1,
    imageUrl: "/items/o1.png",
    size: "w-32 h-32 sm:w-48 sm:h-48",
    position: "top-[10%] left-[15%]",
    animationClass: "animate-[float_6s_ease-in-out_infinite]",
    hoverClass: "hover:scale-125 hover:rotate-12 hover:-translate-y-8",
  },
  {
    id: 2,
    imageUrl: "/items/o2.png",
    size: "w-24 h-24 sm:w-32 sm:h-32",
    position: "bottom-[20%] right-[10%]",
    animationClass: "animate-[drift_8s_ease-in-out_infinite_alternate]",
    hoverClass:
      "hover:-translate-y-12 hover:-translate-x-12 hover:scale-110 hover:rotate-45",
  },
  {
    id: 3,
    imageUrl: "/items/o3.png",
    size: "w-40 h-40 sm:w-64 sm:h-64",
    position: "top-[40%] right-[25%]",
    animationClass: "animate-[float-slow_12s_ease-in-out_infinite]",
    hoverClass: "hover:scale-90 hover:translate-x-8",
  },
  {
    id: 4,
    imageUrl: "/items/o4.png",
    size: "w-24 h-24 sm:w-32 sm:h-32",
    position: "bottom-[30%] left-[25%]",
    animationClass: "animate-[spin-slow_15s_linear_infinite]",
    hoverClass: "hover:scale-150 hover:animate-none", // Pauses spin on hover and scales
  },
];

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans selection:bg-fuchsia-500/30">
      {/* Injecting custom keyframes for the continuous animations 
        Using standard CSS inside a style block allows for complex keyframes 
        without needing to eject or modify tailwind.config.js
      */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(10deg); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
            50% { transform: translateY(-40px) translateX(20px) scale(1.05); }
          }
          @keyframes drift {
            0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
            50% { transform: translateX(40px) translateY(-20px) rotate(-15deg); }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .shape-blob {
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          }
        `}
      </style>

      {/* Background Image Setup */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/items/bg.png')" }}
      ></div>
      {/* Optional dark overlay to ensure text readability against the background image */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

      {/* Render Floating Elements */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className={`
              absolute flex items-center justify-center
              pointer-events-auto cursor-pointer
              transition-all duration-500 ease-out
              ${el.position}
              ${el.animationClass}
              ${el.hoverClass}
              ${el.size}
            `}
          >
            {/* The image object instead of a CSS shape */}
            <img
              src={el.imageUrl}
              alt={`Floating Object ${el.id}`}
              className="w-full h-full object-contain drop-shadow-2xl"
              onError={(e) => {
                // Fallback styling if images are missing
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.classList.add(
                  "bg-white/20",
                  "backdrop-blur-md",
                  "rounded-xl",
                  "border",
                  "border-white/30",
                );
              }}
            />
          </div>
        ))}
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full pointer-events-none px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-cyan-400 drop-shadow-sm mb-6 tracking-tight pointer-events-auto hover:scale-105 transition-transform duration-300">
          Interactive Canvas
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light pointer-events-auto">
          Hover over the floating glass objects to interact with them. They
          feature continuous CSS keyframe animations combined with Tailwind's
          powerful hover transform states.
        </p>

        <button className="mt-10 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium backdrop-blur-md hover:bg-white/15 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/5 transition-all duration-300 pointer-events-auto">
          Get Started
        </button>
      </div>
    </div>
  );
}
