//TODO ENTFERNE
// Navigation - Wait for DOM to be ready (including dynamically loaded header)
const service_id = "service_cxgpf5t";
const template_id = "template_k0cb54w";

// Navigation - Using event delegation for dynamically loaded header
document.addEventListener('click', (e) => {
    // Handle hamburger click
    if (e.target.closest('.hamburger')) {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        const links = document.querySelectorAll('.nav-links li');

        if (navLinks && hamburger) {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');

            // Animate Links
            links.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        }
    }

    // Handle nav link click (close menu)
    if (e.target.closest('.nav-links a')) {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.querySelector('.hamburger');
        const links = document.querySelectorAll('.nav-links li');

        if (navLinks && hamburger) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
            links.forEach(link => {
                link.style.animation = '';
            });
        }
    }
});

// Audio Player
let currentAudio = null;
let currentBtn = null;
let currentTrack = null;
let updateInterval = null;

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Funktion zur Simulation einer Waveform
function generateBars(waveformElement, duration) {
    // NOTE: waveformElement.innerHTML = ''; wurde entfernt. Das Clearen wird nun
    // im togglePlay() vor der Generierung der Waveform vorgenommen, um die korrekte 
    // Struktur des Fortschrittsbalkens zu gewährleisten.

    // Wir generieren eine feste Anzahl von Balken (z.B. 100)
    const numberOfBars = 100;

    for (let i = 0; i < numberOfBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('waveform-bar');

        // Simuliere zufällige Amplitude (Höhe) der Balken
        // Die Höhe ist zufällig, wird aber zur Mitte hin stärker
        const maxAmplitude = 0.9;
        const randomness = 0.6; // Wie stark der Zufall wirkt
        const centerProximity = 1 - Math.abs((i / (numberOfBars - 1)) - 0.5) * 2;

        const baseHeight = (0.3 + centerProximity * 0.7) * maxAmplitude;
        const height = baseHeight * (1 - randomness) + Math.random() * randomness * maxAmplitude;

        // Skaliere auf die volle Höhe des Waveform-Containers (30px)
        bar.style.height = `${Math.max(5, height * 100)}%`;

        waveformElement.appendChild(bar);
    }
}

function updateTimeline(track, audio) {
    const currentTime = audio.currentTime;
    const duration = audio.duration;
    const currentTimeEl = track.querySelector('.current-time');
    const totalTimeEl = track.querySelector('.total-time');

    // NEU: Element für den Waveform-Fortschritt
    const waveformProgress = track.querySelector('.waveform-progress');

    // Update progress
    const percentage = (currentTime / duration); // Wert zwischen 0 und 1
    const percentageString = `${percentage * 100}%`;

    // Waveform-Fortschritt aktualisieren
    if (waveformProgress) {
        waveformProgress.style.width = percentageString;
    }

    // Update current time display
    currentTimeEl.textContent = formatTime(currentTime);

    // Berechne die verbleibende Zeit
    const remainingTime = duration - currentTime;
    totalTimeEl.textContent = "-" + formatTime(remainingTime);
}

function togglePlay(btn) {
    const track = btn.closest('.track');
    const src = track.getAttribute('data-src');
    const isPlaying = btn.classList.contains('playing');

    // 1. Stop any currently playing audio
    if (currentAudio && currentAudio !== null) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset to start
        if (currentBtn) {
            currentBtn.textContent = '▶';
            currentBtn.classList.remove('playing');
            currentBtn.closest('.track').classList.remove('active-track');
        }
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }

        // Waveform beim Stoppen/Zurücksetzen zurücksetzen
        const currentWaveformContainer = currentTrack.querySelector('.waveform');
        if (currentWaveformContainer) currentWaveformContainer.innerHTML = '';

        const currentTimeEl = currentTrack.querySelector('.current-time');
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        const totalTimeEl = currentTrack.querySelector('.total-time');
        if (totalTimeEl) totalTimeEl.textContent = '--:--';
    }

    // 2. If the clicked button was NOT playing, start the new track
    if (!isPlaying) {
        // Create new audio instance
        if (src) {
            const audio = new Audio(src);
            audio.volume = 0.5; // Set a reasonable default volume

            audio.play().then(() => {
                btn.textContent = '⏸';
                btn.classList.add('playing');
                track.classList.add('active-track');

                currentAudio = audio;
                currentBtn = btn;
                currentTrack = track;

                // --- NEUE WAVEFORM INITIALISIERUNG ---
                const waveformContainer = track.querySelector('.waveform');

                // Initialisiere Waveform und setze die Balken, sobald Metadaten geladen sind
                audio.addEventListener('loadedmetadata', function listener() {
                    // 1. Container komplett leeren, um Basis-Balken zu generieren
                    waveformContainer.innerHTML = '';

                    // 2. Generiere die BASIS-Balken (Grau)
                    generateBars(waveformContainer, audio.duration);

                    // 3. Erstelle den Fortschritts-Container (Overlay)
                    const waveformProgress = document.createElement('div');
                    waveformProgress.classList.add('waveform-progress');
                    waveformContainer.appendChild(waveformProgress);

                    // 4. Generiere die Füll-Balken (Farbig) in das Progress-Element.
                    generateBars(waveformProgress, audio.duration);

                    const totalTimeEl = track.querySelector('.total-time');
                    // Setze die Dauer initial
                    totalTimeEl.textContent = formatTime(audio.duration);

                    // Listener nach Ausführung entfernen
                    audio.removeEventListener('loadedmetadata', listener);
                });
                // --- ENDE WAVEFORM INITIALISIERUNG ---

                // Update timeline continuously
                updateInterval = setInterval(() => {
                    updateTimeline(track, audio);
                }, 100);

                // Reset UI when audio ends
                audio.onended = () => {
                    btn.textContent = '▶';
                    btn.classList.remove('playing');
                    track.classList.remove('active-track');
                    currentAudio = null;
                    currentBtn = null;
                    currentTrack = null;
                    if (updateInterval) {
                        clearInterval(updateInterval);
                        updateInterval = null;
                    }
                    // Reset progress bar (nur Zeiten)
                    const currentTimeEl = track.querySelector('.current-time');
                    currentTimeEl.textContent = '0:00';
                    // Reset total time display back to '--:--'
                    const totalTimeEl = track.querySelector('.total-time');
                    totalTimeEl.textContent = '--:--';

                    // NEU: Waveform beim Ende zurücksetzen
                    const currentWaveformContainer = track.querySelector('.waveform');
                    if (currentWaveformContainer) currentWaveformContainer.innerHTML = '';
                };
            }).catch(err => {
                console.error("Audio playback failed:", err);
                alert("Playback failed. Please check console.");
            });
        } else {
            console.error("No audio source found for this track.");
        }
    } else {
        // If it WAS playing, we just paused/stopped it in step 1.
        // So we just clear the state.
        currentAudio = null;
        currentBtn = null;
        currentTrack = null;
    }
}

function seekTo(event, waveformContainer) {
    if (!currentAudio) return;

    // Das waveformContainer Element ist jetzt das klickbare Ziel
    const rect = waveformContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * currentAudio.duration;

    currentAudio.currentTime = newTime;
    updateTimeline(currentTrack, currentAudio);
}

// Lightbox and Hero Slideshow - Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (lightbox && lightboxImg) {
        // Make functions global so they can be called from HTML onclick attributes
        window.openLightbox = function (element) {
            const img = element.querySelector('img');
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        };

        window.closeLightbox = function () {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        };

        // Close lightbox with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                window.closeLightbox();
            }
        });
    }

    // Hero Slideshow
    const slides = document.querySelectorAll('.hero-bg .slide');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    const dotsContainer = document.querySelector('.slide-dots');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0 && dotsContainer && prevBtn && nextBtn) {
        // Initialize Dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');

        // Initialize first slide
        slides[0].classList.add('active');
        slides.forEach((slide, index) => {
            if (index !== 0) slide.style.transform = 'translateX(100%)';
        });

        function goToSlide(index, direction = 'next') {
            if (index === currentSlide) return;

            const outgoingSlide = slides[currentSlide];
            const incomingSlide = slides[index];
            const outgoingDot = dots[currentSlide];
            const incomingDot = dots[index];

            // Update Dots
            outgoingDot.classList.remove('active');
            incomingDot.classList.add('active');

            // Determine animation direction
            if (direction === 'next') {
                // Moving Forward: Out goes Left, In comes from Right
                outgoingSlide.classList.remove('active');
                outgoingSlide.classList.add('exit'); // Moves to -100%

                incomingSlide.classList.add('no-transition');
                incomingSlide.classList.remove('exit');
                incomingSlide.style.transform = 'translateX(100%)'; // Start at Right
            } else {
                // Moving Backward: Out goes Right, In comes from Left
                outgoingSlide.classList.remove('active');
                outgoingSlide.style.transform = 'translateX(100%)'; // Manually move to Right

                incomingSlide.classList.add('no-transition');
                incomingSlide.classList.remove('exit');
                incomingSlide.style.transform = 'translateX(-100%)'; // Start at Left
            }

            // Force reflow
            void incomingSlide.offsetWidth;

            // Animate In
            incomingSlide.classList.remove('no-transition');
            incomingSlide.style.transform = ''; // Clear inline styles
            incomingSlide.classList.add('active'); // Moves to 0%

            // Clean up outgoing slide styles after transition (optional but good for state)
            setTimeout(() => {
                if (direction === 'prev') {
                    // For prev, outgoing needs to stay at right (100%), which is default for non-active
                    outgoingSlide.style.transform = '';
                } else {
                    outgoingSlide.classList.remove('exit');
                    outgoingSlide.style.transform = 'translateX(-100%)'; // Keep it at left until reused
                }
            }, 1200); // Match transition duration

            currentSlide = index;
            resetInterval();
        }

        function nextSlide() {
            const newIndex = (currentSlide + 1) % slides.length;
            goToSlide(newIndex, 'next');
        }

        function prevSlide() {
            const newIndex = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(newIndex, 'prev');
        }

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }

        // Event Listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        // Start Auto-play
        resetInterval();
    }
});


// Gallery Slider
document.addEventListener('DOMContentLoaded', () => {
    const galleryPages = document.querySelectorAll('.gallery-page');
    const galleryPrev = document.querySelector('.gallery-prev');
    const galleryNext = document.querySelector('.gallery-next');
    const galleryDotsContainer = document.querySelector('.gallery-dots');
    let currentGalleryPage = 0;

    if (galleryPages.length > 0 && galleryDotsContainer && galleryPrev && galleryNext) {
        // Create dots
        galleryPages.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('gallery-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToGalleryPage(index));
            galleryDotsContainer.appendChild(dot);
        });

        const galleryDots = document.querySelectorAll('.gallery-dot');

        function goToGalleryPage(index) {
            if (index === currentGalleryPage) return;

            // Remove active class from current page and dot
            galleryPages[currentGalleryPage].classList.remove('active');
            galleryDots[currentGalleryPage].classList.remove('active');

            // Add active class to new page and dot
            galleryPages[index].classList.add('active');
            galleryDots[index].classList.add('active');

            currentGalleryPage = index;
        }

        function nextGalleryPage() {
            const newIndex = (currentGalleryPage + 1) % galleryPages.length;
            goToGalleryPage(newIndex);
        }

        function prevGalleryPage() {
            const newIndex = (currentGalleryPage - 1 + galleryPages.length) % galleryPages.length;
            goToGalleryPage(newIndex);
        }

        // Event Listeners
        galleryNext.addEventListener('click', nextGalleryPage);
        galleryPrev.addEventListener('click', prevGalleryPage);
    }
});


// Booking Form Handling
const bookingForm = document.getElementById('bookingForm');
const eventTypeSelect = document.getElementById('event-type');
const otherEventGroup = document.getElementById('other-event-group');

if (eventTypeSelect && otherEventGroup) {
    eventTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'other') {
            otherEventGroup.style.display = 'block';
            document.getElementById('other-event').required = true;
        } else {
            otherEventGroup.style.display = 'none';
            document.getElementById('other-event').required = false;
        }
    });
}

if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // 1. Gather Data
        let eventType = document.getElementById('event-type').value;
        if (eventType === 'other') {
            eventType = `Sonstiges: ${document.getElementById('other-event').value}`;
        }

        const templateParams = {
            from_name: document.getElementById('name').value,
            from_email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            event_date: document.getElementById('event-date').value,
            event_type: eventType,
            message: document.getElementById('message').value,
            to_email: 'Simon.rohrer04@web.de'
        };

        // 2. Visual Feedback - Loading
        submitBtn.textContent = 'WIRD GESENDET...';
        submitBtn.disabled = true;

        // 3. Send Email via EmailJS
        emailjs.send(service_id, template_id, templateParams)
            .then(() => {
                // Success
                submitBtn.textContent = 'ANFRAGE GESENDET! ✓';
                submitBtn.style.backgroundColor = '#4CAF50';
                submitBtn.style.borderColor = '#4CAF50';
                submitBtn.style.color = '#fff';

                bookingForm.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.style.color = '';
                }, 3000);
            })
            .catch((error) => {
                // Error
                console.error('FAILED...', error);
                submitBtn.textContent = 'FEHLER BEIM SENDEN';
                submitBtn.style.backgroundColor = '#f44336';
                submitBtn.style.borderColor = '#f44336';

                alert('Es gab einen Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut oder schreiben Sie uns direkt eine E-Mail.');

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.borderColor = '';
                }, 3000);
            });
    });
}
// Member Slider Logic
document.addEventListener('DOMContentLoaded', () => {
    const prevBtns = document.querySelectorAll('.member-slider-prev');
    const nextBtns = document.querySelectorAll('.member-slider-next');

    // Initialize sliders: Ensure first image is active if none are
    document.querySelectorAll('.member-img').forEach(card => {
        const images = card.querySelectorAll('img');
        if (images.length > 0) {
            const hasActive = Array.from(images).some(img => img.classList.contains('active'));
            if (!hasActive) {
                images[0].classList.add('active');
            }
        }
    });

    function updateSlide(btn, direction) {
        const card = btn.closest('.member-img');
        const images = card.querySelectorAll('img');
        let activeIndex = 0;

        images.forEach((img, index) => {
            if (img.classList.contains('active')) {
                activeIndex = index;
                img.classList.remove('active');
            }
        });

        let newIndex;
        if (direction === 'prev') {
            newIndex = activeIndex - 1;
            if (newIndex < 0) {
                newIndex = images.length - 1;
            }
        } else {
            newIndex = activeIndex + 1;
            if (newIndex >= images.length) {
                newIndex = 0;
            }
        }

        images[newIndex].classList.add('active');
    }

    prevBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            updateSlide(btn, 'prev');
        });
    });

    nextBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            updateSlide(btn, 'next');
        });
    });
});