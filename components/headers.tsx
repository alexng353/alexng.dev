"use client";

import { useSnow } from "@hooks/use-snow";
import Head from "next/head";
import { useRouter } from "next/router";
import type React from "react";

type HeadersProperties = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  site_name?: string;
} & (
  | {
      /** preferably a 1280x720px image */
      image?: undefined;
      imageAlt?: undefined;
    }
  | {
      /** preferably a 1280x720px image */
      image: string;
      imageAlt: string;
    }
);

export function Headers(props: HeadersProperties) {
  if (typeof window === "undefined") {
    return <HeadersInternal {...props} client={false} />;
  }

  return <HeadersInternal {...props} client={true} />;
}

export function HeadersInternal({
  title,
  description,
  site_name,
  image,
  imageAlt,
  children,
  client,
}: HeadersProperties & {
  client: boolean;
}) {
  const snow = useSnow();
  if (image) image = image.replaceAll("{season}", snow ? "snowy" : "normal");

  return (
    <Head>
      {title && <title>{title}</title>}

      {title && <meta name="title" content={title} />}
      {description && (
        <meta name="description" content={ellipsis(description, 320)} />
      )}

      {/* Open Graph / Facebook */}
      {title && <meta property="og:title" content={title} />}
      {description && (
        <meta property="og:site_name" content={site_name ?? "EduBeyond"} />
      )}
      {image && <meta property="og:image" content={image} />}
      {imageAlt && (
        <meta property="og:image:alt" content={ellipsis(imageAlt, 420)} />
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {title && <meta property="twitter:title" content={title} />}
      {title && (
        <meta property="twitter:site" content={site_name ?? "EduBeyond"} />
      )}
      {description && (
        <meta
          property="twitter:description"
          content={ellipsis(description, 320)}
        />
      )}
      {image && <meta property="twitter:image" content={image} />}
      {imageAlt && (
        <meta property="twitter:image:alt" content={ellipsis(imageAlt, 420)} />
      )}

      {client && <ClientOnly />}

      {children}
    </Head>
  );
}

const ellipsis = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, Math.max(0, length - 3))}...` : text;

function ClientOnly() {
  const router = useRouter();
  const locale = router.locale;
  const url = router.asPath;

  return (
    <>
      {url && <meta property="twitter:url" content={url} />}
      {locale && <meta property="og:locale" content={locale} />}
      {url && <meta property="og:url" content={url} />}
    </>
  );
}
