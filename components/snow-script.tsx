import { useSnow } from "@hooks/use-snow";
import Script from "next/script";

export function SnowScript() {
  const snow = useSnow();
  if (!snow) return null;
  return <Script src="https://app.embed.im/snow.js" defer />;
}
