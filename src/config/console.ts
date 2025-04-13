// Wyłączanie console.logów w środowisku produkcyjnym
if (import.meta.env.PROD) {
  const noop = () => {};
  
  // Zachowujemy tylko krytyczne logi w produkcji
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  
  // Zachowujemy ważne logi błędów i ostrzeżeń
  // console.warn = noop;  // odkomentuj jeśli chcesz wyłączyć warningi
  // console.error = noop; // odkomentuj jeśli chcesz wyłączyć errory
} 