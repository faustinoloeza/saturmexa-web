import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de — SATUR",
};

const techs = [
  "Flutter", "Docker", "NodeJS", "Android", "T-SQL",
  "C#", "Java", "JavaScript", "React", "Django",
  "Python", "Git", "Kotlin Multiplatform",
];

export default function AboutPage() {
  return (
    <div className="h-full flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-content text-2xl font-bold mb-4">
            FL
          </div>
          <h1 className="text-2xl font-bold">Faustino Loeza Pérez</h1>
          <p className="text-base-content/50 text-sm mt-1">Cancún, México</p>
        </div>

        <div className="bg-base-200 rounded-box border border-base-300 p-6 mb-4">
          <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
            Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {techs.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-3 py-1 text-sm border border-base-content/20 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-base-200 rounded-box border border-base-300 p-6">
          <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">
            Enlaces
          </h2>
          <div className="flex flex-col">
            <a
              href="https://github.com/faustinoloeza"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-base-300 transition-colors -mx-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-base-content/70">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-sm">github.com/faustinoloeza</span>
            </a>

            <a
              href="https://faustinoloeza.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-base-300 transition-colors -mx-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-base-content/70">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-sm">faustinoloeza.github.io</span>
            </a>

            <a
              href="mailto:faustinoloezaperez@gmail.com"
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-base-300 transition-colors -mx-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-base-content/70">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 4-10 8L2 4" />
              </svg>
              <span className="text-sm">faustinoloezaperez@gmail.com</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
