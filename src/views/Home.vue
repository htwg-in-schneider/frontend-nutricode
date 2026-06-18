<script setup>
import { ref } from 'vue'

// Empfaenger-Adresse, an die die Kontaktanfrage geschickt wird
// (Platzhalter – vor Veroeffentlichung durch echte Adresse ersetzen)
const CONTACT_EMAIL = 'kontakt@nutricode.de'

// Eingabefelder des Kontaktformulars
const name = ref('')
const email = ref('')
const message = ref('')

// Baut aus den Formulardaten einen mailto:-Link und oeffnet damit
// das E-Mail-Programm des Nutzers mit vorausgefuellter Nachricht.
// Es wird KEINE Mail vom Server verschickt – der Nutzer klickt im
// eigenen Mailprogramm selbst auf "Senden".
function sendMail() {
  const subject = encodeURIComponent(`Kontaktanfrage von ${name.value}`)
  const body = encodeURIComponent(
    `Name: ${name.value}\nE-Mail: ${email.value}\n\n${message.value}`
  )
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
}
</script>


<template>
  <div>
    <!-- HERO -->
    <main class="container">
      <section class="hero">
        <div class="hero-text">
          <span class="hero-tag">Ernährungsplanung mit KI</span>
          <h1 class="hero-heading">
            Dein <em>Code</em> für<br>gesunde Ernährung.
          </h1>
          <p class="hero-sub">
            NutriCode berechnet deinen individuellen Kalorienbedarf
            anhand der Mifflin-St&nbsp;Jeor-Formel und erstellt
            mithilfe von KI einen personalisierten Ernährungsplan.
          </p>
          <div class="hero-actions">
            <router-link to="/ernaehrungsplan" class="btn btn-primary">Jetzt berechnen →</router-link>
            <a href="#features" class="btn btn-outline">Mehr erfahren</a>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-card">
            <p class="hero-card-label">Täglicher Bedarf</p>
            <p class="hero-card-kcal">2.180</p>
            <p class="hero-card-unit">kcal / Tag</p>
            <div class="hero-card-divider"></div>
            <dl class="hero-card-row">
              <dt>Protein</dt><dd>82 g</dd>
            </dl>
            <dl class="hero-card-row">
              <dt>Kohlenhydrate</dt><dd>260 g</dd>
            </dl>
            <dl class="hero-card-row">
              <dt>Fett</dt><dd>78 g</dd>
            </dl>
          </div>
        </div>
      </section>
    </main>

    <!-- ABOUT -->
    <section class="about">
        <div class="container">
        <div class="about-row">

          <div class="about-image">
            <img src="@/assets/images/about-food.jpg" alt="Gesunde Mahlzeit mit frischem Obst und Gemuese">
          </div>

          <div class="about-text">
            <p class="section-tag">Was ist NutriCode?</p>
            <h2 class="section-title">Deine Ernährung, wissenschaftlich berechnet.</h2>
            <p class="about-desc">
              NutriCode ist ein webbasierter Ernährungsplaner, der dir in
              wenigen Schritten deinen persönlichen Tagesbedarf an
              Kalorien und Makronährstoffen berechnet. Die Berechnung
              basiert auf der wissenschaftlich anerkannten
              Mifflin-St&nbsp;Jeor-Formel und berücksichtigt Alter,
              Geschlecht, Größe, Gewicht und dein Aktivitätslevel.
            </p>
            <p class="about-desc">
              Anschließend erstellt unsere KI einen individuell auf dich
              zugeschnittenen Ernährungsplan – egal ob du abnehmen,
              zunehmen oder dein Gewicht halten möchtest. Auch Vorlieben
              wie vegetarisch, vegan oder glutenfrei werden berücksichtigt,
              sodass dein Plan wirklich zu deinem Alltag passt.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- STEPS -->
    <section class="steps">
        <div class="container">
        <div class="section-header">
          <p class="section-tag">So funktioniert's</p>
          <h2 class="section-title">In drei Schritten zum Plan</h2>
        </div>

        <div class="steps-grid">

          <article class="step-card">
            <img src="@/assets/images/step-1.jpg" alt="Eingabe der persoenlichen Daten" class="step-image">
            <p class="step-number">Schritt 1</p>
            <p class="step-name">Daten eingeben</p>
            <p class="step-desc">
              Trage Alter, Größe, Gewicht, Geschlecht und dein
              Aktivitätslevel ein. Das Formular ist in unter einer
              Minute ausgefüllt – ganz ohne vorherige Anmeldung.
            </p>
          </article>

          <article class="step-card">
            <img src="@/assets/images/step-2.jpg" alt="KI generiert einen Ernaehrungsplan" class="step-image">
            <p class="step-number">Schritt 2</p>
            <p class="step-name">Plan erhalten</p>
            <p class="step-desc">
              Unsere KI generiert auf Basis deiner Daten einen
              ausgewogenen Ernährungsplan mit passenden Rezepten,
              Mahlzeiten und genauen Nährwertangaben.
            </p>
          </article>

          <article class="step-card">
            <img src="@/assets/images/step-3.jpg" alt="Ernaehrungsplan als PDF herunterladen" class="step-image">
            <p class="step-number">Schritt 3</p>
            <p class="step-name">PDF mitnehmen</p>
            <p class="step-desc">
              Lade deinen Plan als PDF herunter und habe ihn jederzeit
              auf Smartphone oder Tablet griffbereit – auch unterwegs
              und ohne Internet.
            </p>
          </article>

        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features" id="features">
        <div class="container">
        <div class="section-header">
          <p class="section-tag">Features</p>
          <h2 class="section-title">Warum NutriCode?</h2>
        </div>

        <div class="features-grid">

          <article class="feature-card">
            <div class="feature-icon">⏱</div>
            <p class="feature-name">Schnell</p>
            <p class="feature-desc">Kalorienbedarf in Sekunden berechnet – ganz ohne Anmeldung.</p>
          </article>

          <article class="feature-card">
            <div class="feature-icon">🤖</div>
            <p class="feature-name">KI-basiert</p>
            <p class="feature-desc">Ein individueller Ernährungsplan, generiert per KI-Schnittstelle.</p>
          </article>

          <article class="feature-card">
            <div class="feature-icon">📄</div>
            <p class="feature-name">PDF Export</p>
            <p class="feature-desc">Deinen Plan als PDF herunterladen und überall dabei haben.</p>
          </article>

          <article class="feature-card">
            <div class="feature-icon">✏️</div>
            <p class="feature-name">Personalisiert</p>
            <p class="feature-desc">Berücksichtigt Alter, Geschlecht, Gewicht und deine Präferenzen.</p>
          </article>

          <article class="feature-card">
            <div class="feature-icon">📱</div>
            <p class="feature-name">Responsiv</p>
            <p class="feature-desc">Optimiert für Desktop, Tablet und Smartphone.</p>
          </article>

          <article class="feature-card">
            <div class="feature-icon">🔒</div>
            <p class="feature-name">Sicher</p>
            <p class="feature-desc">Deine Daten gehören dir – sichere Authentifizierung inklusive.</p>
          </article>

        </div>
      </div>
    </section>

    <!-- GERICHTE TEASER -->
    <section class="recipes">
      <div class="container">
        <div class="section-header">
          <p class="section-tag">Inspiration</p>
          <h2 class="section-title">Snack und Bowl Bibliothek</h2>
        </div>
        <p class="recipes-intro">
          Entdecke alle Rezepte, durchsuche sie und filtere nach Kategorie.
        </p>
        <div class="recipes-cta">
          <router-link to="/gerichte" class="btn btn-accent">Zu den Rezepten →</router-link>
        </div>
      </div>
    </section>




    <!-- KONTAKT -->
    <section class="contact" id="kontakt">
      <div class="container">
        <div class="section-header">
          <p class="section-tag">Kontakt</p>
          <h2 class="section-title">Schreib uns eine Nachricht</h2>
        </div>

        <form class="contact-form" @submit.prevent="sendMail">
          <div class="contact-row">
            <label>
              Name
              <input v-model="name" type="text" placeholder="Dein Name" required>
            </label>
            <label>
              E-Mail
              <input v-model="email" type="email" placeholder="dein@email.de" required>
            </label>
          </div>
          <label>
            Nachricht
            <textarea v-model="message" rows="5" placeholder="Deine Nachricht an uns ..." required></textarea>
          </label>
          <button type="submit" class="btn btn-accent">Nachricht senden →</button>
        </form>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="cta-banner">
     <div class="container">
        <h2 class="cta-heading">Bereit für deinen <em>Ernährungsplan</em>?</h2>
        <p class="cta-sub">Personalisiert. KI-gestützt. Immer dabei.</p>
        <router-link to="/ernaehrungsplan" class="btn btn-primary">Kostenlos starten →</router-link>
     </div>
    </section>
  </div>
</template>
