import beerenBowl from './assets/images/recipes/beeren-bowl.png'
import energyBalls from './assets/images/recipes/energy-balls.png'
import quinoaBowl from './assets/images/recipes/quinoa-bowl.png'
import gruenerSmoothie from './assets/images/recipes/gruener-smoothie.png'
import overnightOats from './assets/images/recipes/overnight-oats.png'
import haehnchenWrap from './assets/images/recipes/haehnchen-wrap.jpg'


export const recipes = [
  {
    id: 1,
    name: 'Beeren-Bowl mit Granola',
    category: 'Bowl',
    kcal: 380,
    duration: 5,
    image: beerenBowl,
    description: 'Cremiger Joghurt mit gemischten Beeren und knusprigem Granola. Perfekt für ein schnelles Frühstück.'
  },
  {
    id: 2,
    name: 'Energy Balls mit Datteln',
    category: 'Snack',
    kcal: 95,
    duration: 15,
    image: energyBalls,
    description: 'Süße Energiekugeln aus Datteln, Haferflocken und Nüssen – ideal für unterwegs.'
  },
  {
    id: 3,
    name: 'Quinoa-Buddha-Bowl',
    category: 'Hauptmahlzeit',
    kcal: 540,
    duration: 25,
    image: quinoaBowl,
    description: 'Quinoa mit geröstetem Gemüse, Avocado und Tahini-Dressing – sättigend und nährstoffreich.'
  },
  {
    id: 4,
    name: 'Grüner Smoothie',
    category: 'Smoothie',
    kcal: 220,
    duration: 5,
    image: gruenerSmoothie,
    description: 'Spinat, Banane, Apfel und Ingwer – ein erfrischender Vitaminkick für zwischendurch.'
  },
  {
    id: 5,
    name: 'Overnight Oats mit Mango',
    category: 'Frühstück',
    kcal: 350,
    duration: 5,
    image: overnightOats,
    description: 'Haferflocken über Nacht in Pflanzenmilch eingeweicht, mit frischer Mango und Chiasamen.'
  },
  {
    id: 6,
    name: 'Hähnchen-Wrap mit Avocado',
    category: 'Hauptmahlzeit',
    kcal: 480,
    duration: 15,
    image: haehnchenWrap,
    description: 'Vollkorn-Wrap gefüllt mit gegrilltem Hähnchen, Avocado und knackigem Gemüse.'
  }
]
