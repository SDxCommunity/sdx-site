"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import ArrowLink from "@/app/components/ArrowLink";
import { cleanTitle } from "@/lib/sdx-events";
import { SDX_LUMA } from "@/lib/links";
import type { NetworkEvent } from "@/lib/sdx-calendars";

/** The same soft spectrum as the home hero's wash. */
const PRISM =
  "conic-gradient(from 210deg, #8fe3ec, #c8b8ff, #ffb9a0, #ffe39a, #9ff0c4, #8fe3ec)";

function inZone(event: NetworkEvent, options: Intl.DateTimeFormatOptions) {
  return new Date(event.startDate).toLocaleString("en-US", {
    ...options,
    timeZone: event.timezone || "America/Los_Angeles",
  });
}

/** Luma's placeholder address says nothing, so it is left out. */
function place(event: NetworkEvent) {
  return event.location && !/\btbd\b/i.test(event.location)
    ? event.location
    : null;
}

const STRIPES =
  "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 7px)";

/** The next event, large, on a soft spectrum edge: its Luma cover, then the date and title. */
function Featured({ event }: { event: NetworkEvent }) {
  const where = place(event);
  return (
    <a
      href={event.eventUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid h-full min-h-[320px] overflow-hidden rounded-xl border border-transparent sm:grid-cols-2"
      // A black padding box over a spectrum border box: a 1px edge with clean corners.
      style={{
        background: `linear-gradient(#000, #000) padding-box, ${PRISM} border-box`,
      }}
    >
      <div
        className="relative aspect-square overflow-hidden sm:aspect-auto"
        style={event.coverUrl ? undefined : { backgroundImage: STRIPES }}
      >
        {event.coverUrl && (
          <Image
            src={event.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1152px) 330px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="flex flex-col justify-between p-7 md:p-8">
        <div>
          <time
            dateTime={event.startDate}
            className="block font-display text-5xl md:text-6xl leading-none tracking-tight text-white"
          >
            {inZone(event, { month: "short", day: "numeric" })}
          </time>
          <p className="mt-3 text-sm text-white/55">
            {inZone(event, { weekday: "long" })} ·{" "}
            {inZone(event, { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
        <div className="mt-10">
          <h3
            className="font-display text-2xl leading-snug tracking-tight text-white"
            style={{ textWrap: "balance" }}
          >
            {cleanTitle(event.title)}
          </h3>
          {where && <p className="mt-2 text-sm text-white/50">{where}</p>}
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-white/75 underline underline-offset-4 decoration-white/30 transition-colors duration-200 group-hover:text-white group-hover:decoration-white/60">
            RSVP on Luma
            <ArrowUpRight
              className="h-3.5 w-3.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </a>
  );
}

/** One line per event: date, title, and an arrow that lights on hover. */
function Row({ event }: { event: NetworkEvent }) {
  const thisYear =
    new Date().getFullYear() === new Date(event.startDate).getFullYear();
  return (
    <li>
      <a
        href={event.eventUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group grid grid-cols-[6rem_1fr_auto] items-center gap-3 py-3"
      >
        <time
          dateTime={event.startDate}
          className="text-sm tabular-nums text-white/45"
        >
          {inZone(event, {
            month: "short",
            day: "numeric",
            year: thisYear ? undefined : "numeric",
          })}
        </time>
        <span className="truncate text-sm text-white/80 transition-colors duration-200 group-hover:text-white">
          {cleanTitle(event.title)}
        </span>
        <ArrowUpRight
          className="h-3.5 w-3.5 text-white/25 transition-colors duration-200 group-hover:text-white"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </a>
    </li>
  );
}

function List({ title, events }: { title: string; events: NetworkEvent[] }) {
  return (
    <div>
      <h3 className="font-display text-xl tracking-tight text-white">
        {title}
      </h3>
      <ul className="mt-3 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {events.map((event) => (
          <Row key={event.id} event={event} />
        ))}
      </ul>
    </div>
  );
}

type EventAgendaProps = {
  events: NetworkEvent[];
  loading: boolean;
  /** Past events listed beside the next one. */
  maxPast?: number;
};

/**
 * The main site's events, from the SDx, SDxUCSD, and SDxSDSU Luma calendars: the next event
 * large on the left, and a panel on the right with the rest of the calendar and recent events.
 */
export default function EventAgenda({
  events,
  loading,
  maxPast = 5,
}: EventAgendaProps) {
  const { upcoming, past } = useMemo(() => {
    const soonest = events
      .filter((event) => event.isUpcoming)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    // A weekly series would fill the list, so keep only its newest date.
    const seen = new Set<string>();
    const recent = events
      .filter((event) => !event.isUpcoming)
      .filter((event) => {
        const key = cleanTitle(event.title).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, maxPast);
    return { upcoming: soonest, past: recent };
  }, [events, maxPast]);

  if (loading) {
    return (
      <div className="grid lg:grid-cols-12 gap-6" aria-busy="true">
        <div className="lg:col-span-7 min-h-[320px] rounded-xl border border-white/10 bg-white/[0.02] animate-pulse" />
        <div className="lg:col-span-5 min-h-[320px] rounded-xl border border-white/10 bg-white/[0.02] animate-pulse" />
      </div>
    );
  }

  const [next, ...later] = upcoming;
  // With no past list and nothing else coming up, the next event takes the full width.
  const side = maxPast > 0 || later.length > 0;

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className={side ? "lg:col-span-7" : "lg:col-span-12"}>
        {next ? (
          <Featured event={next} />
        ) : (
          <div className="flex h-full min-h-[320px] flex-col justify-end rounded-xl border border-dashed border-white/15 p-7 md:p-9">
            <p className="font-display text-3xl md:text-4xl tracking-tight text-white/80">
              Nothing on the calendar yet.
            </p>
            <ArrowLink href={SDX_LUMA} className="mt-5">
              Follow SDx on Luma to hear first
            </ArrowLink>
          </div>
        )}
      </div>

      {side && (
        <div className="lg:col-span-5 flex flex-col gap-8 rounded-xl border border-white/10 p-7 md:p-8">
          {later.length > 0 && (
            <List title="Also coming up" events={later.slice(0, 3)} />
          )}
          {maxPast > 0 && past.length > 0 && (
            <List title="History" events={past} />
          )}
          <ArrowLink href={SDX_LUMA} className="mt-auto self-start">
            Luma calendar
          </ArrowLink>
        </div>
      )}
    </div>
  );
}
