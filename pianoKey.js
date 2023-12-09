class PianoKey extends HTMLElement {
  static currentPlaying = null;
  static audioContext = new (window.AudioContext || window.webkitAudioContext)();

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
      }

      .key-container {
        border: 1px solid #000;
        border-radius: 5px;
        box-shadow: 2px 2px 2px #666;
        user-select: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        width: 80px;
        background-color: #fff;
        color: #000;
        margin: 1px 2px;
        position: relative;
        padding-bottom: 20px;
        z-index: 0;
      }

      .key-container:hover {
          background-color: #f7f7f7;
      }

      .key-container:active, .key-container.pressed {
          box-shadow: inset 0px 0px 10px #000000;
          transform: translateY(2px);
      }

      :host([sound*="#"]) .key-container {
        background-color: #000;
        color: #fff;
        width: 60px;
        height: 180px;
        top: -60px;
        margin-left: -30px;
        z-index: 1;
      }

      :host([sound*="#"]) .key-container:hover {
          background-color: #444;
      }

      :host([sound*="#"]) .key-container:active, :host([sound*="#"]) .key-container.pressed {
          box-shadow: inset 0px 0px 5px #000000;
          transform: translateY(2px);
      }

      :host([sound*="#"]):first-of-type .key-container {
        margin-left: 20px;
      }

      :host([sound*="#"]):last-of-type .key-container {
        margin-right: 20px;
      }
    `;

    shadow.appendChild(style);
    const container = document.createElement('div');
    container.textContent = this.getAttribute('label') || 'Play Sound';
    container.classList.add('key-container');
    shadow.appendChild(container);

    container.addEventListener('click', () => this.playSound());
    document.addEventListener('keydown', (event) => {
      if (event.key === this.getAttribute('trigger-key')) {
        this.playSound();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === this.getAttribute('trigger-key')) {
        this.shadowRoot.querySelector('.key-container').classList.add('pressed');
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.key === this.getAttribute('trigger-key')) {
        this.shadowRoot.querySelector('.key-container').classList.remove('pressed');
      }
    });

  }

  playSound() {
    if (PianoKey.currentPlaying) {
      PianoKey.currentPlaying.stop();
      PianoKey.currentPlaying.disconnect();
    }
    let oscillator = PianoKey.audioContext.createOscillator();
    let gainNode = PianoKey.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(PianoKey.audioContext.destination);
    const note = this.getAttribute('sound');
    const frequency = this.getFrequencyForNote(note);
    oscillator.frequency.setValueAtTime(frequency, PianoKey.audioContext.currentTime);
    oscillator.type = 'sine';
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, PianoKey.audioContext.currentTime + 1.5);
    PianoKey.currentPlaying = oscillator;
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
    oscillator.stop(PianoKey.audioContext.currentTime + 1.5);
  }

  getFrequencyForNote(note) {
    const notes = {
      'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18,
      'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13,
      'E4': 329.63,
      'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99,
      'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30,
      'A4': 440.00, 'A#4': 466.16, 'Bb4': 466.16,
      'B4': 493.88,
      'C5': 523.25,
    };
    return notes[note];
  }

  connectedCallback() {
    const keyToPress = this.getAttribute('trigger-key');
    const container = this.shadowRoot.querySelector('.key-container');

    const keySpan = document.createElement('span');
    keySpan.textContent = `${keyToPress.toUpperCase()}`;
    keySpan.style = `
      position: absolute;
      bottom: 5px;
      font-size: 1em;
      color: #666;
    `;

    container.appendChild(keySpan);
  }
}

customElements.define('piano-key', PianoKey);
