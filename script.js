import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 CONFIG FIREBASE CORRETTA
const firebaseConfig = {
    apiKey: "AIzaSyCy5HO84WkxP8qfa0qw1ZoY8EHFVxSanaU",
    authDomain: "mioportfolio-267c9.firebaseapp.com",
    projectId: "mioportfolio-267c9",
    storageBucket: "mioportfolio-267c9.firebasestorage.app",
    messagingSenderId: "823340983391",
    appId: "1:823340983391:web:6f4395677e3e244f51e7ea",
    measurementId: "G-NQQWNV6173"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Effetto Macchina da Scrivere
const words = ["Formattazione PC", "Ottimizzazione", "Ripristino Smartphone", "Configurazione Reti"];
let i = 0, j = 0, isDeleting = false;
const typeTarget = document.getElementById("typewriter");

function typewriter() {
    const currentWord = words[i];
    if (isDeleting) { typeTarget.textContent = currentWord.substring(0, j - 1); j--; } 
    else { typeTarget.textContent = currentWord.substring(0, j + 1); j++; }

    let speed = isDeleting ? 50 : 100;
    if (!isDeleting && j === currentWord.length) { speed = 2000; isDeleting = true; } 
    else if (isDeleting && j === 0) { isDeleting = false; i = (i + 1) % words.length; speed = 500; }
    setTimeout(typewriter, speed);
}
document.addEventListener("DOMContentLoaded", typewriter);

// Animazioni Scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Logica Recensioni e Database
let currentRating = 0;
const modal = document.getElementById('review-modal');
const btnOpen = document.getElementById('btn-open-review');
const btnClose = document.querySelector('.close-modal');
const starsInput = document.querySelectorAll('.star-btn');
const form = document.getElementById('review-form');

btnOpen.addEventListener('click', () => modal.classList.add('show-modal'));
btnClose.addEventListener('click', () => { modal.classList.remove('show-modal'); form.reset(); currentRating=0; updateStarUI(0); });
window.addEventListener('click', (e) => { if (e.target === modal) btnClose.click(); });

starsInput.forEach(star => {
    star.addEventListener('click', () => {
        currentRating = parseInt(star.getAttribute('data-value'));
        updateStarUI(currentRating);
    });
});

function updateStarUI(rating) {
    starsInput.forEach(s => {
        if (parseInt(s.getAttribute('data-value')) <= rating) { s.classList.replace('far', 'fas'); } 
        else { s.classList.replace('fas', 'far'); }
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(currentRating === 0) { alert("Seleziona le stelle!"); return; }

    const name = document.getElementById('rev-name').value.trim() || "Utente Anonimo";
    const text = document.getElementById('rev-text').value.trim();
    const date = new Date().toLocaleDateString('it-IT');
    const timestamp = new Date().getTime();
    const btnSubmit = document.querySelector('.btn-submit');
    
    btnSubmit.innerText = "Invio...";
    try {
        await addDoc(collection(db, "recensioni"), { name, text, stars: currentRating, date, timestamp });
        btnClose.click();
        renderReviews();
    } catch (error) { alert("Errore, riprova."); } 
    finally { btnSubmit.innerText = "Invia Recensione"; }
});

async function renderReviews() {
    const listContainer = document.getElementById('reviews-list');
    listContainer.innerHTML = '<p style="text-align:center;">Caricamento...</p>';
    
    try {
        const q = query(collection(db, "recensioni"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        let reviews = [], totalStars = 0;
        
        querySnapshot.forEach((doc) => reviews.push(doc.data()));
        listContainer.innerHTML = '';

        if(reviews.length === 0) { listContainer.innerHTML = '<p style="text-align:center;">Nessuna recensione.</p>'; return; }

        reviews.forEach(rev => {
            totalStars += rev.stars;
            let starsHTML = '';
            for(let i=1; i<=5; i++) { starsHTML += i <= rev.stars ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>'; }
            listContainer.innerHTML += `
                <div class="review-item">
                    <div class="review-header"><span class="reviewer-name">${rev.name}</span><span class="review-date">${rev.date}</span></div>
                    <div class="review-stars">${starsHTML}</div>
                    <p class="review-text">${rev.text}</p>
                </div>`;
        });

        const average = (totalStars / reviews.length).toFixed(1);
        document.getElementById('average-rating').innerText = average;
        document.getElementById('total-reviews').innerText = reviews.length;

        const avgStarsContainer = document.getElementById('average-stars');
        avgStarsContainer.innerHTML = '';
        for(let i=1; i<=5; i++) {
            if(i <= Math.floor(average)) avgStarsContainer.innerHTML += '<i class="fas fa-star"></i>';
            else if(i === Math.ceil(average) && average % 1 !== 0) avgStarsContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
            else avgStarsContainer.innerHTML += '<i class="far fa-star"></i>';
        }
    } catch (error) { listContainer.innerHTML = '<p style="text-align:center;color:red;">Errore caricamento.</p>'; }
}

document.addEventListener("DOMContentLoaded", renderReviews);

// Logica NFC Smartwatch
window.addEventListener('DOMContentLoaded', () => {
    if(window.location.hash === '#lascia-recensione') {
        setTimeout(() => { document.getElementById('recensioni').scrollIntoView(); btnOpen.click(); }, 800);
    }
});
