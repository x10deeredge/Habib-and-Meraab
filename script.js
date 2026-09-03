/* ================= PASSCODE KEYPAD LOGIC ================= */
let enteredCode = "";
const correctCode = "2608";

function pressKey(num) {
    if (enteredCode.length < 4) {
        enteredCode += num;
        updateDisplay();
    }
}

function clearKey() {
    enteredCode = "";
    updateDisplay();
    document.getElementById('error-msg').textContent = "";
}

function updateDisplay() {
    const display = document.getElementById('passcode-display');
    if (!display) return;
    let dots = "";
    for (let i = 0; i < 4; i++) {
        dots += i < enteredCode.length ? " ❤️ " : " _ ";
    }
    display.textContent = dots;
}

function submitCode() {
    const errorMsg = document.getElementById('error-msg');
    if (enteredCode === correctCode) {
        if (errorMsg) errorMsg.textContent = "";
        gsap.to("#passcode-screen", {
            opacity: 0,
            scale: 1.1,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                document.getElementById('passcode-screen').style.display = 'none';
                const main = document.getElementById('main-content');
                main.classList.remove('opacity-0', 'pointer-events-none');
                gsap.fromTo(main, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" });
            }
        });
    } else {
        if (errorMsg) errorMsg.textContent = "Galat password! Dobara try karein. ❌";
        gsap.fromTo("#passcode-display", { x: -10 }, { x: 10, repeat: 3, yoyo: true, duration: 0.08 });
        enteredCode = "";
        updateDisplay();
    }
}


/* ================= 3D WEBGL HEART & PARTICLES ================= */
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 32;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(244, 63, 94, 0.85)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
}

const particleCount = 6500;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const originalPositions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const color1 = new THREE.Color('#f43f5e');
const color2 = new THREE.Color('#d946ef');
const color3 = new THREE.Color('#fb7185');

for (let i = 0; i < particleCount; i++) {
    const t = Math.PI * 2 * Math.random();
    const u = Math.PI * (Math.random() - 0.5);
    
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    const z = u * 11; 

    const scale = 0.75 + Math.random() * 0.5;
    const px = (x + (Math.random() - 0.5) * 2.2) * scale;
    const py = (y + (Math.random() - 0.5) * 2.2) * scale;
    const pz = (z + (Math.random() - 0.5) * 2.2) * scale;

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;

    originalPositions[i * 3] = px;
    originalPositions[i * 3 + 1] = py;
    originalPositions[i * 3 + 2] = pz;

    const mixedColor = color1.clone().lerp(Math.random() > 0.5 ? color2 : color3, Math.random());
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.85,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    map: createParticleTexture(),
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const heartParticles = new THREE.Points(geometry, particleMaterial);
scene.add(heartParticles);

let mouse = new THREE.Vector2(-999, -999);
let raycaster = new THREE.Raycaster();
let plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('mouseleave', () => {
    mouse.set(-999, -999);
});

let clock = new THREE.Clock();

function animateThree() {
    requestAnimationFrame(animateThree);
    const elapsedTime = clock.getElapsedTime();

    const pulse = 1 + Math.sin(elapsedTime * 3.8) * 0.1 + Math.sin(elapsedTime * 7.5) * 0.035;
    heartParticles.scale.set(pulse, pulse, pulse);
    heartParticles.rotation.y = elapsedTime * 0.2;
    heartParticles.rotation.z = Math.sin(elapsedTime * 0.6) * 0.06;

    raycaster.setFromCamera(mouse, camera);
    let targetWorldPos = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetWorldPos);

    const posAttr = geometry.attributes.position;
    const posArray = posAttr.array;

    for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        let ox = originalPositions[ix] * pulse;
        let oy = originalPositions[iy] * pulse;
        let oz = originalPositions[iz] * pulse;

        let particlePos = new THREE.Vector3(posArray[ix], posArray[iy], posArray[iz]);
        let dist = particlePos.distanceTo(targetWorldPos);

        let targetX = ox;
        let targetY = oy + Math.sin(elapsedTime * 2.5 + ox * 0.5) * 0.4;
        let targetZ = oz;

        if (dist < 8.0) {
            let force = (8.0 - dist) / 8.0;
            let dir = new THREE.Vector3().subVectors(particlePos, targetWorldPos).normalize();
            targetX += dir.x * force * 12;
            targetY += dir.y * force * 12;
            targetZ += dir.z * force * 12;
        }

        posArray[ix] += (targetX - posArray[ix]) * 0.08;
        posArray[iy] += (targetY - posArray[iy]) * 0.08;
        posArray[iz] += (targetZ - posArray[iz]) * 0.08;
    }
    posAttr.needsUpdate = true;

    renderer.render(scene, camera);
}
animateThree();

const cardWrapper = document.getElementById('card-wrapper');

cardWrapper.addEventListener('mousemove', (e) => {
    const rect = cardWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = (-y / (rect.height / 2)) * 10;
    const rotateY = (x / (rect.width / 2)) * 10;

    gsap.to(cardWrapper, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 1200,
        ease: "power2.out",
        duration: 0.2
    });
});

cardWrapper.addEventListener('mouseleave', () => {
    gsap.to(cardWrapper, {
        rotationX: 0,
        rotationY: 0,
        ease: "power3.out",
        duration: 0.5
    });
});

// Nickname selection state
let selectedNames = {
    her: "Meeraab",
    him: "Habib"
};

function selectNickname(type, val, btn) {
    if (type === 'her') {
        document.querySelectorAll('.nick-btn-her').forEach(b => b.classList.remove('bg-rose-600', 'text-white'));
        document.getElementById('custom-her').value = '';
        selectedNames.her = val;
    } else {
        document.querySelectorAll('.nick-btn-him').forEach(b => b.classList.remove('bg-rose-600', 'text-white'));
        document.getElementById('custom-him').value = '';
        selectedNames.him = val;
    }
    btn.classList.add('bg-rose-600', 'text-white');
}

function setCustomNickname(type, val) {
    if (val.trim() !== '') {
        if (type === 'her') {
            document.querySelectorAll('.nick-btn-her').forEach(b => b.classList.remove('bg-rose-600', 'text-white'));
            selectedNames.her = val.trim();
        } else {
            document.querySelectorAll('.nick-btn-him').forEach(b => b.classList.remove('bg-rose-600', 'text-white'));
            selectedNames.him = val.trim();
        }
    }
}

function teleportTrollButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const randomX = (Math.random() - 0.5) * 160;
    const randomY = (Math.random() - 0.5) * 80;
    gsap.to(btn, { x: randomX, y: randomY, duration: 0.15 });
}

function startStoryWithNicknames() {
    document.querySelectorAll('.dynamic-her').forEach(el => el.textContent = selectedNames.her);
    document.querySelectorAll('.dynamic-him').forEach(el => el.textContent = selectedNames.him);
    showCard(1);
}

let currentCard = 0;

function showCard(cardNum) {
    const activeOldCard = document.getElementById(`card-${currentCard}`);
    const newCard = document.getElementById(`card-${cardNum}`);

    if (cardNum === 7 && activeOldCard.id !== 'card-7') {
        triggerCelebration();
        return;
    }

    const tl = gsap.timeline();

    tl.to(activeOldCard, {
        opacity: 0,
        scale: 0.7,
        rotationX: -60,
        rotationY: 180,
        y: -120,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            activeOldCard.classList.remove('active');
            newCard.classList.add('active');
            currentCard = cardNum;
        }
    })
    .fromTo(newCard, 
        { opacity: 0, scale: 0.7, rotationX: 60, rotationY: -180, y: 120 },
        { opacity: 1, scale: 1, rotationX: 0, rotationY: 0, y: 0, duration: 0.55, ease: "back.out(1.5)" }
    );
}

function nextCard(num) { showCard(num); }
function prevCard(num) { showCard(num); }

function teleportButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const randomX = (Math.random() - 0.5) * 220;
    const randomY = (Math.random() - 0.5) * 100;
    gsap.to(btn, { x: randomX, y: randomY, duration: 0.18 });
}

const compliments = [
    "💖 Reality Check: Aap duniya ki sabse pyari ladki hain!",
    "🌹 Warning: Aapko dekhe bina mera din nahi guzarta!",
    "✨ Fact: Aap meri sabse badi khushi aur weakness hain!",
    "🌙 Queen Alert: Aapke bina meri life bilkul boring hai!"
];
function generateCompliment() {
    const box = document.getElementById('compliment-box');
    const randomText = compliments[Math.floor(Math.random() * compliments.length)];
    gsap.fromTo(box, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 });
    box.textContent = randomText;
}

const excuses = [
    "😂 Reason: Aapko gussa dilane mein jo maza hai woh kahin nahi!",
    "💖 Reason: Ladai ke baad jab aap 'jao baat nahi karni' kehti hain, tab aap aur pyari lagti hain!",
    "🌙 Reason: Aapko manane ka apna hi ek alag nasha hai!"
];
function generateExcuse() {
    const box = document.getElementById('excuse-box');
    const randomText = excuses[Math.floor(Math.random() * excuses.length)];
    gsap.fromTo(box, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
    box.textContent = randomText;
}

function revealConfession() {
    const secret = document.getElementById('secret-text');
    secret.classList.toggle('hidden');
    gsap.fromTo(secret, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
}

const loveSlider = document.getElementById('love-slider');
const meterValue = document.getElementById('meter-value');
const meterText = document.getElementById('meter-text');

if (loveSlider) {
    loveSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        meterValue.textContent = `${val}%`;
        if (val < 2500) {
            meterText.textContent = "Bas itna pyaar? Thoda aur slide karo mere pagalpan ke liye! 😉";
        } else if (val < 6000) {
            meterText.textContent = "Ab baat ban rahi hai! You mean the absolute universe to me. ❤️";
        } else if (val < 9500) {
            meterText.textContent = "Behad bepanah, pagal kar dene wala pyaar! Infinite & Beyond! ✨";
        } else {
            meterText.textContent = "MAXIMUM OBSESSION OVERLOAD! Mera dil sirf aur sirf aapka diwana hai! 💖🌹";
        }
    });
}

let celebrationAudio = null;

function triggerCelebration() {
    confetti({
        particleCount: 250,
        spread: 140,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#d946ef', '#fbbf24', '#ffffff']
    });

    if (!celebrationAudio) {
        celebrationAudio = new Audio('song.mp3');
        celebrationAudio.volume = 1.0;
    }
    celebrationAudio.currentTime = 0;
    celebrationAudio.play().catch(e => console.log("Audio play blocked by browser policy:", e));

    startLoveStorm();

    const activeOldCard = document.getElementById(`card-${currentCard}`);
    const newCard = document.getElementById(`card-7`);

    const tl = gsap.timeline();
    tl.to(activeOldCard, {
        opacity: 0,
        scale: 0.7,
        rotationX: -60,
        rotationY: 180,
        y: -120,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            activeOldCard.classList.remove('active');
            newCard.classList.add('active');
            currentCard = 7;
        }
    })
    .fromTo(newCard, 
        { opacity: 0, scale: 0.7, rotationX: 60, rotationY: -180, y: 120 },
        { opacity: 1, scale: 1, rotationX: 0, rotationY: 0, y: 0, duration: 0.55, ease: "back.out(1.5)" }
    );
}

function startLoveStorm() {
    const rainContainer = document.getElementById('love-rain-container');
    rainContainer.classList.remove('hidden');

    for (let i = 0; i < 80; i++) {
        const span = document.createElement('span');
        span.className = 'floating-love-text';
        span.textContent = "Love You ❤️";
        
        span.style.left = `${Math.random() * 100}vw`;
        span.style.fontSize = `${Math.random() * 2 + 1.2}rem`;
        span.style.opacity = Math.random() * 0.8 + 0.2;
        
        rainContainer.appendChild(span);

        gsap.fromTo(span, {
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 150,
            rotation: (Math.random() - 0.5) * 60
        }, {
            y: -150,
            x: `+=${(Math.random() - 0.5) * 300}`,
            rotation: (Math.random() - 0.5) * 120,
            duration: Math.random() * 3.5 + 3,
            repeat: -1,
            delay: Math.random() * 3,
            ease: "none"
        });
    }
}

function resetStory() {
    if (celebrationAudio) {
        celebrationAudio.pause();
        celebrationAudio.currentTime = 0;
    }

    const rainContainer = document.getElementById('love-rain-container');
    rainContainer.innerHTML = '';
    rainContainer.classList.add('hidden');
    showCard(0);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
