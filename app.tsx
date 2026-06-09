// ── Step 1: Add this import at the top of src/App.tsx ──
import MediBot from './MediBot';

// ── Step 2: Inside the return() of App, just before </div> ──
// (the outermost closing div, right above the <footer>)

      <MediBot />

// Example — your return looks like:
// return (
//   <div style={{ fontFamily: ... }}>
//     <Nav />
//     { page === "home" && <HomePage /> }
//     ...
//     <MediBot />        <-- add here
//     <footer>...</footer>
//   </div>
// );