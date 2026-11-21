import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "./site-header";

// shortcut: drop is hardcoded, read it from GET /api/drops/current (via src/lib/api) once the drops contract exists
const drop = { label: "Drop 01 · Autumn", href: "/drops" };

// Home hero "H1 · Cover", spec in CLAUDE.md §8.1. Motion classes live in globals.css.
export function Hero() {
  return (
    <section className="relative h-svh min-h-[560px] overflow-hidden bg-ivory">
      <SiteHeader overlay className="hero-fade" />

      {/* Wordmark, behind the model */}
      <div className="hero-parallax-slow absolute inset-x-0 top-[72px] z-[1] flex justify-center">
        <h1
          aria-label="VEYL"
          className="font-serif text-[32vw] font-medium leading-[0.9] tracking-[-0.04em] sm:text-[26vw] lg:text-[clamp(160px,30vw,480px)]"
        >
          {["V", "E", "Y", "L"].map((letter, i) => (
            <span key={i} aria-hidden="true" className="hero-rise inline-block" style={{ animationDelay: `${i * 60}ms` }}>
              {letter}
            </span>
          ))}
        </h1>
      </div>

      {/* Model cut-out, in front of the wordmark, feet on the bottom edge */}
      <div className="hero-parallax-fast absolute inset-x-0 bottom-0 z-[2] flex h-[75%] justify-center sm:h-[83%]">
        <Image
          src="/assets/hero-cutout.webp"
          alt="Model in an oversized ivory wool coat, grey knit and wide stone trousers"
          width={525}
          height={1343}
          sizes="(max-width: 640px) 60vw, 400px"
          preload
          className="hero-model h-full w-auto"
        />
      </div>

      <div className="hero-fade absolute inset-x-0 bottom-0 z-[3] flex flex-col gap-5 px-5 pb-8 sm:flex-row sm:items-end sm:justify-between sm:px-12 sm:pb-10">
        <div>
          <p className="text-[11px] uppercase tracking-[.16em] text-grey">{drop.label}</p>
          <p className="mt-2 font-serif text-2xl italic leading-tight sm:text-[30px]">
            Quiet pieces,
            <br />
            made to stay.
          </p>
        </div>
        <Link
          href={drop.href}
          className="inline-flex min-h-11 items-center self-start text-[13px] uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px] sm:self-auto"
        >
          Shop the drop <span aria-hidden="true">&nbsp;→</span>
        </Link>
      </div>
    </section>
  );
}
