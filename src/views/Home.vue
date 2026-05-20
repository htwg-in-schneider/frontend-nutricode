<script setup>
import { ref, onMounted } from 'vue'
import DishCard from '../components/DishCard.vue'
import DishFilter from '../components/DishFilter.vue'
import { API_BASE } from '../config.js'

const dishes = ref([])
const error = ref(null)

async function fetchDishes(params = {}) {
  try {
    const query = new URLSearchParams()
    if (params.name) query.append('name', params.name)
    if (params.category) query.append('category', params.category)

    const url = query.toString()
      ? `${API_BASE}/api/dish?${query.toString()}`
      : `${API_BASE}/api/dish`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Fehler beim Laden der Gerichte')
    dishes.value = await response.json()
    error.value = null
  } catch (err) {
    error.value = err.message
  }
}

onMounted(() => fetchDishes())
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
            <a href="#" class="btn btn-primary">Jetzt berechnen →</a>
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

    <!-- GERICHTE -->
    <section class="recipes">
      <div class="container">
        <div class="section-header">
          <p class="section-tag">Inspiration</p>
          <h2 class="section-title">Snack und Bowl Bibliothek</h2>
        </div>
        <div style="text-align: right; margin-bottom: 1.5rem;">
          <router-link to="/dish/new" class="btn btn-accent">+ Neues Gericht</router-link>
        </div>

        <DishFilter @search="fetchDishes" />

        <p v-if="error" class="dish-error">{{ error }}</p>
        <div class="recipes-grid">
          <DishCard
            v-for="dish in dishes"
            :key="dish.id"
            :dish="dish"
          />
        </div>
      </div>
    </section>



    <!-- CTA BANNER -->
    <section class="cta-banner"> 
     <div class="container">
        <h2 class="cta-heading">Bereit für deinen <em>Ernährungsplan</em>?</h2>
        <p class="cta-sub">Personalisiert. KI-gestützt. Immer dabei.</p>
        <a href="#" class="btn btn-primary">Kostenlos starten →</a>
     </div>
    </section>
  </div>
</template>
