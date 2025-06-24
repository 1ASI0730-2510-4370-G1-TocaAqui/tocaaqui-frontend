// Mapeo de claves de i18n a valores del backend enum
export const MUSIC_GENRE_KEYS = [
  'rock',
  'pop', 
  'jazz',
  'blues',
  'classical',
  'electronic',
  'folk',
  'hiphop',
  'metal',
  'reggaeton',
  'salsa',
  'cumbia',
  'other'
];

// Mapeo de valores de UI (español/inglés) a valores del backend enum
export const UI_TO_BACKEND_GENRE_MAP = {
  // Español
  'Rock': 'Rock',
  'Pop': 'Pop',
  'Jazz': 'Jazz',
  'Electrónica': 'Electronic',
  'Hip Hop': 'HipHop',
  'Reggaeton': 'Reggaeton',
  'Salsa': 'Salsa',
  'Cumbia': 'Cumbia',
  'Clásica': 'Classical',
  'Folk': 'Folk',
  'Metal': 'Metal',
  'Blues': 'Blues',
  'Otro': 'Other',
  
  // Inglés
  'Electronic': 'Electronic',
  'Classical': 'Classical',
  'Other': 'Other'
};

// Mapeo inverso: de valores del backend a claves de i18n
export const BACKEND_TO_I18N_KEY_MAP = {
  'Rock': 'rock',
  'Pop': 'pop',
  'Jazz': 'jazz',
  'Blues': 'blues',
  'Classical': 'classical',
  'Electronic': 'electronic',
  'Folk': 'folk',
  'HipHop': 'hiphop',
  'Metal': 'metal',
  'Reggaeton': 'reggaeton',
  'Salsa': 'salsa',
  'Cumbia': 'cumbia',
  'Other': 'other'
};

/**
 * Convierte un género de la UI al valor esperado por el backend
 * @param {string} uiGenre - Género como aparece en la UI
 * @returns {string} - Valor del enum del backend
 */
export function getBackendGenre(uiGenre) {
  return UI_TO_BACKEND_GENRE_MAP[uiGenre] || uiGenre;
}

/**
 * Convierte un valor del backend a la clave de i18n
 * @param {string} backendGenre - Valor del enum del backend
 * @returns {string} - Clave para i18n
 */
export function getI18nKey(backendGenre) {
  return BACKEND_TO_I18N_KEY_MAP[backendGenre] || backendGenre.toLowerCase();
}

/**
 * Obtiene las opciones de géneros para un dropdown usando i18n
 * @param {Function} t - Función de traducción de i18n
 * @returns {Array} - Array de objetos {label, value, backendValue}
 */
export function getMusicGenreOptions(t) {
  return MUSIC_GENRE_KEYS.map(key => ({
    label: t(`musicGenres.${key}`),
    value: t(`musicGenres.${key}`),
    backendValue: getBackendGenre(t(`musicGenres.${key}`)),
    key: key
  }));
} 