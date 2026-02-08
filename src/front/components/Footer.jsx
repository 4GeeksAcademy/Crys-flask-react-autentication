import React from "react";

export const Footer = () => (
  <footer className="footer-magic-container mt-auto">
    <div className="footer-separator">
      <div className="magic-line"></div>
      <div className="magic-dot"></div>
      <div className="magic-line"></div>
    </div>

    <div className="container py-4">
      <div className="row align-items-center">
        <div className="col-12 text-center">
          <p className="footer-copyright mb-2">
            © 2026 <span className="text-gold fw-bold">Crystian Ariel Carmona Trujillo</span>
          </p>
          
          <div className="footer-nav mb-3 d-flex justify-content-center align-items-center flex-wrap">
            <a
              href="https://github.com/crysc4rmon4-web"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link-gold"
            >
              <i className="fa-brands fa-github me-2"></i>GitHub
            </a>
            <span className="footer-divider mx-3">|</span>
            <span className="footer-craft">
              Crafted with <span className="heart-magic">❤️</span> & <code>magic_code</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);