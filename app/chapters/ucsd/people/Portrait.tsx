'use client'

import React, { useEffect, useRef, useState } from 'react';
import type { Alum } from './people';

/** The default profile picture: a plain head-and-shoulders silhouette. */
function DefaultAvatar({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={`bg-[#1c1c1e] ${className}`}
      role="img"
      aria-label="No photo"
    >
      <circle cx="50" cy="40" r="17" fill="#3a3a3c" />
      <path d="M14 100c0-21 16-35 36-35s36 14 36 35z" fill="#3a3a3c" />
    </svg>
  );
}

/** A person's photo, or the default avatar when there is none or it fails to load. */
export default function Portrait({ person, className }: { person: Alum; className: string }) {
  // Remember which URL failed, so the dialog can switch people without carrying a failure over.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // A server-rendered image can fail before React attaches onError, so check after each new photo.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailedSrc(person.photo ?? null);
  }, [person.photo]);

  if (!person.photo || failedSrc === person.photo) return <DefaultAvatar className={className} />;

  return (
    // Photos come from LinkedIn and public/people; next/image would need each host allowlisted.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={person.photo}
      alt={person.name}
      draggable={false}
      className={`object-cover object-[center_25%] ${className}`}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(person.photo ?? null)}
    />
  );
}
