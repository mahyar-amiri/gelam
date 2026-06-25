"use client";

import { useState, useEffect } from "react";

export function Divider() {
  return <div className="border-t border-zinc-800/60 mx-3 my-0.5" />;
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 pt-1">
      {children}
    </p>
  );
}

function SectionHeader({
  label,
  open,
  onToggle,
  badge,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-widest uppercase text-amber-400/80 hover:text-amber-300 transition-colors cursor-pointer"
    >
      <span className="flex items-center gap-2">
        {label}
        {badge && (
          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full tracking-normal normal-case font-normal">
            {badge}
          </span>
        )}
      </span>
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

// Section: Model Uploader
export function ModelUploaderSection({
  selectedModel,
  onSelectModel,
}: {
  selectedModel: string;
  onSelectModel: (url: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [models, setModels] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      if (data.models) setModels(data.models);
    } catch (e) {
      console.error("Error fetching models:", e);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/models", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        await fetchModels();
        onSelectModel(`/models/${data.name}`);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ""; // Reset input
    }
  };

  return (
    <>
      <SectionHeader
        label="Model Uploader"
        open={open}
        onToggle={() => setOpen((s) => !s)}
      />
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <div className="flex flex-col gap-2">
            <SubLabel>Available Models</SubLabel>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {models.length === 0 && (
                <span className="text-[11px] text-zinc-500">No models found in public/models</span>
              )}
              {models.map((m) => {
                const modelUrl = `/models/${m}`;
                const isActive = selectedModel === modelUrl;
                return (
                  <button
                    key={m}
                    onClick={() => onSelectModel(modelUrl)}
                    className={`text-left text-[11px] px-2 py-1.5 rounded-md transition-colors cursor-pointer truncate ${
                      isActive
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-zinc-400 hover:bg-zinc-800"
                    }`}
                    title={m}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
          
          <Divider />
          
          <div>
            <SubLabel>Upload New Model</SubLabel>
            <label className="mt-1 flex items-center justify-center w-full px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 rounded-full transition-all cursor-pointer text-center">
              {isUploading ? "Uploading..." : "Select .glb / .gltf"}
              <input
                type="file"
                accept=".glb,.gltf"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      )}
    </>
  );
}
