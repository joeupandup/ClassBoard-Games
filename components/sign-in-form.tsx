"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("teacher@example.com");
  const [name, setName] = useState("Teacher Joseph");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    if (!response.ok) {
      setError("The local preview could not create a session.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <section className="sign-in-page">
      <div className="sign-in-copy">
        <p className="eyebrow">Teacher workspace</p>
        <h1>Welcome back to your game shelf.</h1>
        <p>
          Production preview uses a signed, HttpOnly demo session. Replace it
          with the chosen identity provider before public launch.
        </p>
      </div>
      <form className="panel sign-in-form" onSubmit={submit}>
        <span className="sign-in-icon">
          <LockKeyhole />
        </span>
        <h2>Preview sign in</h2>
        <div className="field">
          <label htmlFor="signin-name">Display name</label>
          <input
            id="signin-name"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="signin-email">Email address</label>
          <input
            id="signin-email"
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="button button--sun button--full" type="submit">
          Enter preview <ArrowRight size={17} />
        </button>
        <small>
          No password is collected in preview mode. Public launch will use
          verified email or school SSO.
        </small>
      </form>
    </section>
  );
}
