// Assume cookPopcorn and pourDrinks are async functions returning Promises
// Assume startMovie is a regular synchronous function
async function setupMovieNight() {
  console.log("Starting setup...");

  // Wait for the popcorn Promise to resolve
  await cookPopcorn();
  console.log("Popcorn is ready!");

  // Wait for the drinks Promise to resolve (or maybe it's quick/sync)
  await pourDrinks();
  console.log("Drinks are poured!");

  // Only runs after both awaits complete successfully
  startMovie();
  console.log("Movie started!");
}

// Example placeholder for an async function returning a Promise
function cookPopcorn() {
  console.log("Putting popcorn in microwave...");
  // Simulate a delay (e.g., 2 seconds)
  return new Promise(resolve => setTimeout(() => {
    console.log("Microwave finished!");
    resolve(); // Fulfill the promise after the delay
  }, 2000));
}

// Assume pourDrinks is similar or faster/synchronous for simplicity


setupMovieNight();