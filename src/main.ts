import './styles/main.css';
import './styles/themes.css';

/**
 * IGNITE TYPE - MAIN ENTRY POINT
 */

// --- DATA CORPUS ---
const CORPUS = {
    homeRow: "adfljks sad flask salads falls asks dads",
    common: "the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us",
    sentences: [
        "The quick brown fox jumps over the lazy dog.",
        "Pack my box with five dozen liquor jugs.",
        "How vexingly quick daft zebras jump!",
        "Sphinx of black quartz, judge my vow.",
        "Two driven jocks help fax my big quiz."
    ],
    paragraphs: [
        "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
        "The sky above the port was the color of television, tuned to a dead channel. 'It's not like I'm using,' Case heard someone say, as he shouldered his way through the crowd around the door of the Chat. 'It's like my body's developed this massive drug deficiency.'",
        "Far out in the uncharted backwaters of the unfashionable end of the western spiral arm of the Galaxy lies a small unregarded yellow sun. Orbiting this at a distance of roughly ninety-two million miles is an utterly insignificant little blue green planet."
    ],
    code: [
        "function hello(name) { return `Hello ${name}`; }",
        "const array = [1, 2, 3].map(n => n * 2);",
        "document.getElementById('app').innerHTML = '<h1>Hi</h1>';",
        "for (let i = 0; i < 10; i++) { console.log(i); }",
        "import React, { useState } from 'react';",
        ".container { display: flex; justify-content: center; }"
    ]
};

// --- STATE & CONFIG ---
const CONFIG = {
    themes: ['theme-cyberpunk', 'theme-glass', 'theme-pixel', 'theme-bento', 'theme-retro'],
    modes: ['F1', 'F2', 'F3', 'F4', 'F5'],
};

const STATE = {
    themeIdx: 0,
    modeIdx: 1, // Start at F2 (Alpha)
    soundEnabled: true,
    fireEnabled: true,
    fingersEnabled: true,
    isPlaying: false,
    isPaused: false,
    text: "",
    cursor: 0,
    startTime: 0,
    wpm: 0,
    errors: 0,
    correctChars: 0,
    streak: 0,
    maxStreak: 0,
    lastKeystroke: 0,
    petLevel: 1,
    totalTyped: 0,
    pauseStartTime: null as number | null
};

// --- DOM ELEMENTS ---
const $ = (id: string) => document.getElementById(id)!;
const canvas = $('fire-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// --- KEYBOARD LAYOUT DEFINITION ---
const KEYBOARD_ROWS = [
    [
        {k:'`', s:'finger-p-l'}, {k:'1', s:'finger-p-l'}, {k:'2', s:'finger-r-l'}, {k:'3', s:'finger-m-l'}, {k:'4', s:'finger-i-l'}, {k:'5', s:'finger-i-l'}, {k:'6', s:'finger-i-r'}, {k:'7', s:'finger-i-r'}, {k:'8', s:'finger-m-r'}, {k:'9', s:'finger-r-r'}, {k:'0', s:'finger-p-r'}, {k:'-', s:'finger-p-r'}, {k:'=', s:'finger-p-r'}, {k:'←', w:'w-2', s:'finger-p-r', code: 'Backspace'}
    ],
    [
        {k:'Tab', w:'w-1-5', s:'finger-p-l', code: 'Tab'}, {k:'Q', s:'finger-p-l'}, {k:'W', s:'finger-r-l'}, {k:'E', s:'finger-m-l'}, {k:'R', s:'finger-i-l'}, {k:'T', s:'finger-i-l'}, {k:'Y', s:'finger-i-r'}, {k:'U', s:'finger-i-r'}, {k:'I', s:'finger-m-r'}, {k:'O', s:'finger-r-r'}, {k:'P', s:'finger-p-r'}, {k:'[', s:'finger-p-r'}, {k:']', s:'finger-p-r'}, {k:'\\', s:'finger-p-r'}
    ],
    [
        {k:'CAPS', w:'w-1-75', s:'finger-p-l', code: 'CapsLock'}, {k:'A', s:'finger-p-l'}, {k:'S', s:'finger-r-l'}, {k:'D', s:'finger-m-l'}, {k:'F', s:'finger-i-l'}, {k:'G', s:'finger-i-l'}, {k:'H', s:'finger-i-r'}, {k:'J', s:'finger-i-r'}, {k:'K', s:'finger-m-r'}, {k:'L', s:'finger-r-r'}, {k:';', s:'finger-p-r'}, {k:"'", s:'finger-p-r'}, {k:'ENTER', w:'w-2-25', s:'finger-p-r', code: 'Enter'}
    ],
    [
        {k:'SHIFT', w:'w-2-5', s:'finger-p-l', code: 'ShiftLeft'}, {k:'Z', s:'finger-p-l'}, {k:'X', s:'finger-r-l'}, {k:'C', s:'finger-m-l'}, {k:'V', s:'finger-i-l'}, {k:'B', s:'finger-i-l'}, {k:'N', s:'finger-i-r'}, {k:'M', s:'finger-i-r'}, {k:',', s:'finger-m-r'}, {k:'.', s:'finger-r-r'}, {k:'/', s:'finger-p-r'}, {k:'SHIFT', w:'w-2-5', s:'finger-p-r', code: 'ShiftRight'}
    ],
    [
        {k:'CTRL', w:'w-1-5', code: 'ControlLeft'}, {k:'ALT', w:'w-1-5', code: 'AltLeft'}, {k:'SPACE', w:'w-6', s:'finger-t', code: 'Space'}, {k:'ALT', w:'w-1-5', code: 'AltRight'}, {k:'CTRL', w:'w-1-5', code: 'ControlRight'}
    ]
];

// --- AUDIO SYSTEM (Procedural) ---
const AudioSys = {
    ctx: null as AudioContext | null,
    init: function() {
        if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    },
    playClick: function() {
        if (!STATE.soundEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Randomize slightly for "mechanical" feel
        const detune = Math.random() * 20 - 10;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600 + detune, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    },
    playError: function() {
        if (!STATE.soundEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },
    playCombo: function() {
        if (!STATE.soundEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
};

// --- INITIALIZATION ---
function init() {
    // Render Keyboard
    const kbContainer = $('visual-keyboard');
    KEYBOARD_ROWS.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'kb-row';
        row.forEach(keyCfg => {
            const keyEl = document.createElement('div');
            keyEl.className = `key ${keyCfg.w || ''} ${keyCfg.s || ''}`;
            // Use data-label for CSS ::before content
            keyEl.setAttribute('data-label', keyCfg.k);
            
            // Logic mapping
            keyEl.dataset.key = keyCfg.k.toLowerCase();
            // Special handling for labels vs keys
            if(keyCfg.k === 'SPACE') keyEl.dataset.key = ' ';
            if(keyCfg.k === '←') keyEl.dataset.key = 'backspace';
            
            if(keyCfg.code) keyEl.dataset.code = keyCfg.code;
            rowEl.appendChild(keyEl);
        });
        kbContainer.appendChild(rowEl);
    });

    // LocalStorage Load
    loadProgress();

    // Set Initial Mode
    resetGame();

    // Event Listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('blur', () => { if(STATE.isPlaying) togglePause(true); });
    $('resume-btn').addEventListener('click', () => togglePause(false));
    
    // Global click handlers for buttons
    $('btn-theme').addEventListener('click', () => cycleTheme());
    $('btn-close-help').addEventListener('click', () => toggleModal('help-modal'));

    // Start Loop
    resizeCanvas();
    requestAnimationFrame(gameLoop);
}

// --- GAME LOGIC ---

function generateText() {
    const mode = CONFIG.modes[STATE.modeIdx];
    let content = "";
    
    if (mode === 'F1') {
        const words = CORPUS.homeRow.split(' ');
        content = Array.from({length: 8}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
    } else if (mode === 'F2') {
        const words = CORPUS.common.split(' ');
        content = Array.from({length: 15}, () => words[Math.floor(Math.random() * words.length)]).join(' ');
    } else if (mode === 'F3') {
        content = CORPUS.sentences[Math.floor(Math.random() * CORPUS.sentences.length)] + " " + CORPUS.sentences[Math.floor(Math.random() * CORPUS.sentences.length)];
    } else if (mode === 'F4') {
        content = CORPUS.paragraphs[Math.floor(Math.random() * CORPUS.paragraphs.length)];
    } else if (mode === 'F5') {
            content = CORPUS.code[Math.floor(Math.random() * CORPUS.code.length)];
    }

    return content.trim();
}

function resetGame() {
    STATE.text = generateText();
    STATE.cursor = 0;
    STATE.errors = 0;
    STATE.correctChars = 0;
    STATE.streak = 0;
    STATE.startTime = 0;
    STATE.isPlaying = false;
    STATE.isPaused = false;
    
    renderText();
    updateStats();
    highlightNextKey();
    $('combo-display').classList.remove('visible');
    $('stats-time').textContent = '0:00';
}

function renderText() {
    const container = $('typing-text');
    container.innerHTML = '';
    
    STATE.text.split('').forEach((char, idx) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'char';
        if (idx === STATE.cursor) span.classList.add('current');
        container.appendChild(span);
    });
    
    highlightNextKey();
}

function updateStats() {
    // WPM Calc
    if (STATE.startTime && STATE.isPlaying) {
        const elapsed = (Date.now() - STATE.startTime) / 60000;
        const wpm = Math.round((STATE.correctChars / 5) / (elapsed || 0.001));
        STATE.wpm = wpm > 0 ? wpm : 0;
    }

    $('stats-wpm').textContent = STATE.wpm.toString();
    $('stats-streak').textContent = STATE.streak.toString();
    
    // Combo
    const comboEl = $('combo-display');
    if (STATE.streak >= 5) {
        comboEl.textContent = `${STATE.streak}x COMBO`;
        comboEl.classList.add('visible');
        if (STATE.streak % 10 === 0) AudioSys.playCombo();
    } else {
        comboEl.classList.remove('visible');
    }

    fireIntensity = STATE.wpm > 80 ? 3 : STATE.wpm > 55 ? 2 : STATE.wpm > 40 ? 1 : 0;
    
    // Progress
    const prog = Math.floor((STATE.cursor / STATE.text.length) * 100);
    $('progress-bar').style.width = `${prog}%`;
    $('prog-pct').textContent = `${prog}%`;
}

function highlightNextKey() {
    document.querySelectorAll('.next-hint').forEach(el => el.classList.remove('next-hint'));
    
    if (STATE.cursor >= STATE.text.length) return;

    const char = STATE.text[STATE.cursor].toLowerCase();
    let selector = `.key[data-key="${char}"]`;
    if (char === ' ') selector = `.key[data-code="Space"]`;
    
    const keyEl = document.querySelector(selector);
    if (keyEl) keyEl.classList.add('next-hint');
}

// --- INPUT HANDLING ---
function handleKeyDown(e: KeyboardEvent) {
    if (STATE.isPaused && e.key !== 'Escape') return;

    // Shortcuts
    if (e.altKey) {
        if (e.key === 't') { cycleTheme(); e.preventDefault(); return; }
        if (e.key === 's') { STATE.soundEnabled = !STATE.soundEnabled; e.preventDefault(); return; }
        if (e.key === 'f') { document.body.classList.toggle('show-fingers'); e.preventDefault(); return; }
        if (e.key === 'x') { STATE.fireEnabled = !STATE.fireEnabled; e.preventDefault(); return; }
        if (e.key === 'r') { resetGame(); e.preventDefault(); return; }
        if (e.key === 'h') { toggleModal('help-modal'); e.preventDefault(); return; }
    }

    if (e.key === 'Escape') { togglePause(); return; }
    if (e.key.startsWith('F') && e.key.length === 2) {
        const idx = parseInt(e.key[1]) - 1;
        if (idx >= 0 && idx < 5) {
            STATE.modeIdx = idx;
            $('mode-indicator').textContent = `MODE: ${CONFIG.modes[idx]}`;
            resetGame();
            e.preventDefault();
            return;
        }
    }

    // Visuals
    const code = e.code;
    const keyEl = document.querySelector(`.key[data-code="${code}"]`) || 
                    document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`);
    
    if (keyEl) {
        keyEl.classList.add('active');
        spawnFire(keyEl as HTMLElement);
    }

    // Typing
    if (e.key.length === 1 || e.key === 'Backspace') {
        e.preventDefault();
        
        if (!STATE.isPlaying && e.key.length === 1) {
            STATE.isPlaying = true;
            STATE.startTime = Date.now();
            AudioSys.init();
        }

        if (STATE.cursor >= STATE.text.length) return;

        const targetChar = STATE.text[STATE.cursor];
        const charEls = $('typing-text').children;

        if (e.key === targetChar) {
            // CORRECT
            charEls[STATE.cursor].classList.add('correct');
            charEls[STATE.cursor].classList.remove('current');
            STATE.cursor++;
            if (STATE.cursor < STATE.text.length) charEls[STATE.cursor].classList.add('current');
            
            STATE.correctChars++;
            STATE.streak++;
            AudioSys.playClick();
            createGhostText(e.key, keyEl as HTMLElement);
            
            if (STATE.cursor === STATE.text.length) {
                finishRound();
            }
        } else {
            // INCORRECT
            if (e.key !== targetChar) {
                STATE.errors++;
                STATE.streak = 0;
                const kb = $('visual-keyboard');
                kb.classList.remove('shake');
                void kb.offsetWidth; 
                kb.classList.add('shake');
                AudioSys.playError();
                charEls[STATE.cursor].classList.add('incorrect');
            }
        }
        updateStats();
        highlightNextKey();
    }
}

function handleKeyUp(e: KeyboardEvent) {
    const code = e.code;
    const keyEl = document.querySelector(`.key[data-code="${code}"]`) || 
                    document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`);
    if (keyEl) keyEl.classList.remove('active');
}

function createGhostText(char: string, keyEl: HTMLElement) {
    if (!keyEl) return;
    const rect = keyEl.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.textContent = char;
    ghost.className = 'ghost-char';
    const drift = (Math.random() * 40 - 20) + 'px';
    ghost.style.setProperty('--drift', drift);
    ghost.style.left = (rect.left + rect.width/2) + 'px';
    ghost.style.top = (rect.top) + 'px';
    document.body.appendChild(ghost);
    ghost.addEventListener('animationend', () => ghost.remove());
}

function finishRound() {
    STATE.isPlaying = false;
    STATE.totalTyped += STATE.text.length;
    localStorage.setItem('ignite_total_chars', STATE.totalTyped.toString());
    
    const flash = document.createElement('div');
    flash.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:var(--text-main);opacity:0.2;z-index:100;transition:opacity 0.5s`;
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity='0'; setTimeout(()=>flash.remove(), 500); }, 100);

    if (STATE.wpm > parseInt(localStorage.getItem('ignite_best_wpm') || '0')) {
        localStorage.setItem('ignite_best_wpm', STATE.wpm.toString());
        $('stat-best').textContent = STATE.wpm.toString();
    }

    setTimeout(resetGame, 1000);
}

function togglePause(force?: boolean) {
    if (force !== undefined) STATE.isPaused = force;
    else STATE.isPaused = !STATE.isPaused;

    const modal = $('pause-modal');
    if (STATE.isPaused) {
        modal.classList.add('open');
        STATE.pauseStartTime = Date.now();
    } else {
        modal.classList.remove('open');
        if (STATE.pauseStartTime) {
            STATE.startTime += (Date.now() - STATE.pauseStartTime);
            STATE.pauseStartTime = null;
        }
    }
}

// --- FIRE & PARTICLES ---
let particles: Particle[] = [];
let fireIntensity = 0; 

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    decay: number;
    size: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -(Math.random() * 2 + 2 + fireIntensity); 
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.01;
        this.size = Math.random() * 5 + 4 + (fireIntensity * 2);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.95;
    }
    draw(ctx: CanvasRenderingContext2D) {
        const baseHue = getComputedStyle(document.body).getPropertyValue('--fire-base').trim();
        const hue = parseInt(baseHue) + (1 - this.life) * 40; 
        const alpha = this.life;
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function spawnFire(keyEl: HTMLElement) {
    if (!STATE.fireEnabled) return;
    const rect = keyEl.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    const count = 5 + (fireIntensity * 3);
    
    for(let i=0; i<count; i++) {
        const px = (rect.left - canvasRect.left) + (Math.random() * rect.width);
        const py = (rect.bottom - canvasRect.top) - 5;
        particles.push(new Particle(px, py));
    }
}

function resizeCanvas() {
    const rect = $('keyboard-container').getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (STATE.fireEnabled) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);
            if (p.life <= 0) particles.splice(i, 1);
        }
        
        if (fireIntensity >= 2 && Math.random() > 0.8) {
                const x = Math.random() * canvas.width;
                particles.push(new Particle(x, canvas.height));
        }
    }

    // Update Timer
    if (STATE.isPlaying && !STATE.isPaused) {
        const elapsedSeconds = Math.floor((Date.now() - STATE.startTime) / 1000);
        const mins = Math.floor(elapsedSeconds / 60);
        const secs = elapsedSeconds % 60;
        $('stats-time').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    requestAnimationFrame(gameLoop);
}

// --- UTILS ---
function cycleTheme() {
    document.body.classList.remove(CONFIG.themes[STATE.themeIdx]);
    STATE.themeIdx = (STATE.themeIdx + 1) % CONFIG.themes.length;
    document.body.classList.add(CONFIG.themes[STATE.themeIdx]);
    localStorage.setItem('ignite_theme', STATE.themeIdx.toString());
}

function toggleModal(id: string) {
    const el = $(id);
    el.classList.toggle('open');
    if (el.classList.contains('open')) {
        togglePause(true);
    } else {
        togglePause(false);
    }
}

function loadProgress() {
    const savedTheme = localStorage.getItem('ignite_theme');
    if (savedTheme) {
        document.body.classList.remove(CONFIG.themes[0]);
        STATE.themeIdx = parseInt(savedTheme);
        document.body.classList.add(CONFIG.themes[STATE.themeIdx]);
    }
    $('stat-best').textContent = localStorage.getItem('ignite_best_wpm') || '0';
    STATE.totalTyped = parseInt(localStorage.getItem('ignite_total_chars') || '0');
}

// --- START ---
window.onload = init;
