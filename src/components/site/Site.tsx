"use client";

import type { Content, SectionId } from "@/lib/default-content";
import { Ambient, ScrollTop } from "./Ambient";
import { Contact, Footer } from "./Contact";
import Cursor from "./Cursor";
import Hero from "./Hero";
import Nav from "./Nav";
import Preloader from "./Preloader";
import Projects from "./Projects";
import { Providers } from "./Providers";
import { About, Credentials, Experience, Marquee, Services, Skills, Stats, Testimonials } from "./Sections";

// Sections that carry a numbered "01 / GET /about" label.
const NUMBERED = new Set(["about", "services", "projects", "experience", "skills", "credentials", "testimonials", "contact"]);

export default function Site({ content: c }: { content: Content }) {
  const visible = (c.layout as SectionId[]).filter((id) => c[id]?.visible);
  let n = 0;

  return (
    <Providers loader={c.loader.enabled} smooth={c.site.smoothScroll}>
      {c.loader.enabled && <Preloader data={c.loader} />}
      {c.site.cursor && <Cursor />}
      <Ambient />
      <div className="grain" aria-hidden="true" />
      <Nav site={c.site} nav={c.nav} />
      <main className="overflow-x-clip">
        <Hero data={c.hero} />
        {visible.map((id) => {
          const index = NUMBERED.has(id) ? ++n : 0;
          switch (id) {
            case "stats":
              return <Stats key={id} data={c.stats} />;
            case "marquee":
              return <Marquee key={id} data={c.marquee} />;
            case "about":
              return <About key={id} data={c.about} index={index} />;
            case "services":
              return <Services key={id} data={c.services} index={index} />;
            case "projects":
              return <Projects key={id} data={c.projects} index={index} />;
            case "experience":
              return <Experience key={id} data={c.experience} index={index} />;
            case "skills":
              return <Skills key={id} data={c.skills} index={index} />;
            case "credentials":
              return <Credentials key={id} data={c.credentials} index={index} />;
            case "testimonials":
              return <Testimonials key={id} data={c.testimonials} index={index} />;
            case "contact":
              return <Contact key={id} data={c.contact} index={index} />;
          }
        })}
      </main>
      <Footer data={c.footer} brand={{ text: c.site.logoText, accent: c.site.logoAccent }} />
      <ScrollTop />
    </Providers>
  );
}
