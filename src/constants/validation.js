// Zentrale Validierungsgrenzen des Frontends.
// Spiegelt die Backend-Grenzen aus ValidationLimits.java (Zahlen) bzw. den
// @Size-Annotationen der Entitäten Dish/Ingredient (Textlängen) – beide müssen
// übereinstimmen (Frontend prüft vorab, das Backend prüft verbindlich).
export const LIMITS = {
  // Plan- und Profilname
  NAME_MAX: 100,
  // Anzahl Tage eines Ernährungsplans
  DAYS_MIN: 1,
  DAYS_MAX: 7,
  // Kalorien (Tagesziel sowie Obergrenze einzelner Gerichte)
  CALORIES_MIN: 1,
  CALORIES_MAX: 15000,
  DISH_CALORIES_MIN: 0,
  // Körperdaten für die Mifflin-Berechnung (Plausibilitätsgrenzen)
  AGE_MIN: 1,
  AGE_MAX: 99,
  HEIGHT_MIN: 50,
  HEIGHT_MAX: 250,
  WEIGHT_MIN: 20,
  WEIGHT_MAX: 400,
  // Textlängen (spiegeln @Size der Entitäten Dish/Ingredient)
  DISH_TITLE_MAX: 120,
  DISH_DESC_MAX: 1000,
  IMAGE_URL_MAX: 500,
  INGREDIENT_NAME_MAX: 120,
  INGREDIENT_AMOUNT_MAX: 60,
  // Weitere Freitextfelder (reine UI-Begrenzung, damit keine absurd langen
  // Eingaben entstehen)
  ADDRESS_MAX: 200,
  PREF_TEXT_MAX: 200,
  MESSAGE_MAX: 2000,
  EMAIL_MAX: 254,
}
