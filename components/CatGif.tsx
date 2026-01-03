"use client";
import Image from "next/image";
import { useState } from "react";

export function CatGif() {
  const [showCatGif, setShowCatGif] = useState(false);
  return (
    <div className="grid place-items-center mt-4">
      {showCatGif && (
        <Image
          src="https://cdn.alexng.dev/assets/ayo.icu/cat.webp"
          alt="cat"
          width={400}
          height={400}
        />
      )}
      <button
        type="button"
        onClick={() => setShowCatGif((prev) => !prev)}
        className="text-green-500 hover:bg-gray-500 rounded-lg px-4 py-2 transition-all"
      >
        {showCatGif ? "Hide the cat gif" : "Show me the cat gif"}
      </button>
    </div>
  );
}
