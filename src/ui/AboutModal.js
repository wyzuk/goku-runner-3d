export class AboutModal {
  constructor(container) {
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop hidden';
    this.element.innerHTML = `
      <div class="modal-card anime-card">
        <div class="modal-header">
          <div class="logo-badge">⚡ WYZUK GOKU RUN ⚡</div>
          <button class="close-btn" id="about-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="developer-card">
            <div class="dev-badge">OFFICIAL DEVELOPER</div>
            <h2 class="dev-name">Wyzuk</h2>
            <p class="dev-quote">"Designed & Developed with passion by Wyzuk."</p>
            <div class="dev-links">
              <a href="https://github.com/wyzuk" target="_blank" rel="noopener noreferrer" class="link-btn github-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub Profile (@wyzuk)
              </a>
              <a href="https://github.com/wyzuk/goku-runner-3d" target="_blank" rel="noopener noreferrer" class="link-btn repo-btn">
                📦 Project Repository (goku-runner-3d)
              </a>
            </div>
          </div>

          <div class="about-section">
            <h3>About the Game</h3>
            <p>
              <strong>Wyzuk Goku Run</strong> is a browser-based 3D endless runner inspired by anime adventures.
              Dodge obstacles, collect Dragon Balls, gather Ki energy, unleash Super Saiyan transformations, and survive an ever-changing procedural world!
            </p>
          </div>

          <div class="tech-stack-grid">
            <div class="tech-item"><span class="tech-title">Engine</span>Three.js (WebGL)</div>
            <div class="tech-item"><span class="tech-title">Audio</span>Web Audio API Synth</div>
            <div class="tech-item"><span class="tech-title">Version</span>1.0.0 Stable</div>
            <div class="tech-item"><span class="tech-title">Bundler</span>Vite & ES Modules</div>
          </div>

          <div class="license-notice">
            <p>Original 3D Character Model, Procedural Biomes & Synth Soundtracks created by <strong>Wyzuk</strong>. Licensed under the MIT License.</p>
          </div>
        </div>
      </div>
    `;
    this.container.appendChild(this.element);

    this.element.querySelector('#about-close-btn').addEventListener('click', () => {
      this.hide();
    });
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
