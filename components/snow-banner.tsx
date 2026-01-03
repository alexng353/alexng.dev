"use client";
import { useSnow } from "@hooks/use-snow";
import { useMemo } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useIsClient, useLocalStorage } from "usehooks-ts";

export const SnowBanner = () => {
  const snow = useSnow();
  const dateFmt = useMemo(
    () =>
      new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "numeric",
      }),
    [],
  );
  const [showBanner, setShowBanner] = useLocalStorage(`snow-${dateFmt}`, true);
  const client = useIsClient();

  if (!client) return;
  if (!snow) return;
  if (!showBanner) return;

  return (
    <div className="flex flex-row w-full justify-center bg-green-500">
      <a
        href="https://embed.im/snow/"
        className="text-white text-center hover:underline px-4 py-2"
      >
        snow effect from embed.im/snow
      </a>

      <button
        type="button"
        onClick={() => setShowBanner(false)}
        className="text-white text-center hover:underline px-4 py-2"
      >
        <AiOutlineClose className="hover:scale-125" />
      </button>
    </div>
  );
};
