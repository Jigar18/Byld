import Image from "next/image";
import { Github, Plus } from "lucide-react";
import BuildScene from "./BuildScene";
import GitHubButton from "./GitHubButton";
import "./landing.css";

const steps = [
  { title: "Sign in with GitHub", body: "No new account or password. Your GitHub identity is your Byldit identity." },
  { title: "Choose your repositories", body: "Install the Byldit GitHub app and pick exactly which repositories it can read." },
  { title: "Fill in the rest", body: "Confirm the details and skills suggested from GitHub, then import the projects worth showing." },
  { title: "Share the link", body: "Your page is live at byldit.vercel.app/your-username. Edit it there whenever something changes." },
];

const questions = [
  ["Do I need a domain or hosting?", "No. Byldit hosts your portfolio at byldit.vercel.app followed by your GitHub username."],
  ["Do private repositories show up?", "No. A repository appears on your portfolio only after you import it yourself."],
  ["Do I have to write any code?", "No. Every section is edited through forms on the page itself."],
  ["What comes from GitHub?", "Your profile details, the repositories you import, suggested skills and your contribution calendar. Experience, education and certificates are yours to add."],
  ["Can I change it later?", "Yes. Sign in, open your page and edit any section. Changes are live as soon as you save."],
  ["What do visitors see?", "Only what you publish. Editing controls and account actions are visible to you alone."],
];

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="lp">
      <BuildScene />

      <section id="how-it-works" aria-labelledby="how-title" className="lp-section">
        <div className="lp-wrap">
          <h2 id="how-title" className="lp-display lp-h2">Live in four steps.</h2>
          <ol className="lp-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="lp-display lp-step-number" aria-hidden="true">{index + 1}</span>
                <h3 className="lp-display">{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="questions" aria-labelledby="questions-title" className="lp-section lp-section-tight">
        <div className="lp-wrap lp-questions">
          <h2 id="questions-title" className="lp-display lp-h2">Before you sign in.</h2>
          <div>
            {questions.map(([question, answer]) => (
              <details key={question} className="lp-question">
                <summary>
                  {question}
                  <Plus aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="closing-title" className="lp-closing">
        <div className="lp-wrap">
          <h2 id="closing-title" className="lp-display">Put your work at one link.</h2>
          <GitHubButton variant="paper" />
          <footer>
            <p className="lp-brand">
              <Image src="/landing/byldit-mark-mono.webp" alt="" width={34} height={34} />
              Byldit
            </p>
            <p>Developer portfolios, built from GitHub.</p>
            <div>
              <span>© {new Date().getFullYear()} Byldit</span>
              <a href="https://github.com/Jigar18/Byld" target="_blank" rel="noreferrer" aria-label="Byldit on GitHub"><Github className="h-5 w-5" /></a>
              <a href="https://x.com/jigark0" target="_blank" rel="noreferrer" aria-label="Jigar on X"><XLogo /></a>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
