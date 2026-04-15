// IPRestricted.jsx
import React, { useEffect, useState } from "react";
import "../../css/IPRestricted.css";

const IPRestricted = () => {
  const [animate, setAnimate] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);

    // Animated dots for the status text
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`ip-page ${animate ? "ip-page--visible" : ""}`}>
      {/* ── Animated Background ── */}
      <div className="ip-bg">
        <div className="ip-bg__orb ip-bg__orb--1" />
        <div className="ip-bg__orb ip-bg__orb--2" />
        <div className="ip-bg__orb ip-bg__orb--3" />
        <div className="ip-bg__grid" />
      </div>

      {/* ── Floating Particles ── */}
      <Particles />

      {/* ── Main Card ── */}
      <div className="ip-card">
        {/* Top accent bar */}
        <div className="ip-card__accent" />

        {/* Card inner */}
        <div className="ip-card__inner">
          {/* Status Badge */}
          <div className="ip-badge">
            <span className="ip-badge__dot" />
            <span className="ip-badge__text">Access Denied</span>
          </div>

          {/* Shield Icon */}
          <div className="ip-shield">
            <div className="ip-shield__ring ip-shield__ring--1" />
            <div className="ip-shield__ring ip-shield__ring--2" />
            <div className="ip-shield__icon-wrap">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="ip-shield__svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4M12 16h.01"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="ip-heading">
            <h1 className="ip-heading__title">IP Address Restricted</h1>
            <p className="ip-heading__sub">
              Your current network is not authorized to access this application.
            </p>
          </div>

          {/* Divider */}
          <div className="ip-divider">
            <span className="ip-divider__line" />
            <span className="ip-divider__icon">🔒</span>
            <span className="ip-divider__line" />
          </div>

          {/* Info Box */}
          <div className="ip-infobox">
            <div className="ip-infobox__icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="ip-infobox__content">
              <p className="ip-infobox__title">Office Network Only</p>
              <p className="ip-infobox__desc">
                This application is exclusively accessible within the
                <strong> authorized office IP range</strong>. Please connect to
                the office network or contact your IT administrator for remote
                access.
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="ip-stats">
            <div className="ip-stats__item">
              <div className="ip-stats__icon ip-stats__icon--red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="ip-stats__label">Your IP</p>
              <p className="ip-stats__value ip-stats__value--red">Blocked</p>
            </div>

            <div className="ip-stats__divider" />

            <div className="ip-stats__item">
              <div className="ip-stats__icon ip-stats__icon--amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <p className="ip-stats__label">Status</p>
              <p className="ip-stats__value ip-stats__value--amber">Restricted</p>
            </div>

            <div className="ip-stats__divider" />

            <div className="ip-stats__item">
              <div className="ip-stats__icon ip-stats__icon--blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="ip-stats__label">Required</p>
              <p className="ip-stats__value ip-stats__value--blue">Office IP</p>
            </div>
          </div>

          {/* Steps */}
          <div className="ip-steps">
            <p className="ip-steps__heading">How to get access?</p>
            <div className="ip-steps__list">
              {[
                {
                  num: "01",
                  icon: "🏢",
                  text: "Connect to the office Wi-Fi or LAN network",
                },
                {
                  num: "02",
                  icon: "🔑",
                  text: "Use company VPN if you are working remotely",
                },
                {
                  num: "03",
                  icon: "📞",
                  text: "Contact IT support for access configuration",
                },
              ].map((step) => (
                <div className="ip-steps__item" key={step.num}>
                  <div className="ip-steps__num">{step.num}</div>
                  <div className="ip-steps__icon">{step.icon}</div>
                  <p className="ip-steps__text">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="ip-footer">
            <div className="ip-footer__status">
              <span className="ip-footer__dot" />
              <span className="ip-footer__checking">
                Checking network status{dots}
              </span>
            </div>
            <p className="ip-footer__copy">
              © {new Date().getFullYear()} &nbsp;·&nbsp; IT Security Department
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Particle Sub-component ───────────────────────────────────────────────────
const Particles = () => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: Math.random() * 10 + 10,
    color: ["#ef4444", "#f97316", "#3b82f6", "#8b5cf6"][
      Math.floor(Math.random() * 4)
    ],
  }));

  return (
    <div className="ip-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="ip-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default IPRestricted;