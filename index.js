import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvHVc-TRxNXyyAwmlpPn7agRpqwGdASfc",
    authDomain: "setjob-23717.firebaseapp.com",
    projectId: "setjob-23717",
    storageBucket: "setjob-23717.firebasestorage.app",
    messagingSenderId: "307680673058",
    appId: "1:307680673058:web:a907324888bae733cfb97b"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elements
const domainInput = document.getElementById("domain");
const generateBtn = document.getElementById("generateBtn");
const outputElement = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const notification = document.getElementById("notification");

// Titles to ignore
const TITLES = [
  "MPH",
  "MMIS",
  "Jr",
  "Dr",
  "MSc",
  "MBCS",
  "Ph.D",
  "PES",
  "CSNC",
  "MBV",
  "PMP",
  "III",
  "SHRM-CP",
  "EIT",
  "PA-C",
  "CPA",
  "PT",
  "DPT",
  "Assoc.",
  "AIA",
  "MBA",
  "BSN",
  "RN",
  "GSP",
  "MSA",
  "CRCST",
  "RHIT",
  "MN",
  "CFA",
  "J.D.",
  "Esq.",
  "UACRM",
  "MSEE",
  "PharmD",
  "OTS",
  "OSHA",
  "SST",
  "PLS",
  "R.T.",
  "CT",
  "ARRT",
  "BSBA",
  "LPC",
  "MSN",
  "B.S.",
  "M.S.",
  "PsyD",
  "MLS",
  "ASCP",
  "MSW",
  "SWP",
  "c-PRS",
  "c-SCT",
  "c-MIT",
  "aPHR",
  "IEng",
  "MAPM",
  "Eng",
  "RN-BSN",
  "LSW",
  "OTR/L",
  "STNA",
  "LMSW",
  "(ASCP)cm",
  "DVM",
  "MA",
  "LPCC",
  "MPP",
  "BCBA",
  "COBA",
  "CF-SLP",
  "MPAS",
  "OTR",
  "AuD",
  "CCC-A",
  "PMHNP-BC",
  "LCSW",
  "RYT",
  "JD",
  "LL.M.",
  "P.E.",
  "LSP",
  "CTS",
  "DMD",
  "DNP",
  "APN",
  "OTD",
  "SPT",
  "MSOT",
  "LAC",
  "NCC",
  "BSW",
  "ODS-C",
  "MSHRM",
  "RPh",
  "ACAS"
];

// Event listener for the Generate button
generateBtn.addEventListener("click", async () => {
  copyBtn.style.display = "block";

  const inputText = domainInput.value.trim();
  const uniqueLines = removeDuplicateLines(inputText);

  const results = await Promise.all(
    uniqueLines.map(async (line) => {
      if (!line.trim()) return ""; // Skip empty lines

      const correctedLine = correctInput(line);
      const domain = extractDomain(correctedLine);

      if (domain) {
        const ceoName = await getCEOName(domain);
        if (ceoName) {
          return `${ceoName}\n${correctedLine}\n\n`; // CEO name found
        }
      }
      return `\n${correctedLine}\n\n`; // No CEO name found, blank line instead
    })
  );

  const formattedOutput = results.join(""); // Combine results with blank lines
  outputElement.textContent = formattedOutput;
});

// Function to remove duplicate lines
function removeDuplicateLines(inputText) {
  const lines = inputText.split("\n");
  const uniqueLines = new Set();
  return lines
    .filter((line) => {
      const trimmed = line.trim();
      if (uniqueLines.has(trimmed)) return false;
      uniqueLines.add(trimmed);
      return true;
    })
    .map((line) => line.trim());
}

// Function to correct the input line
function correctInput(line) {
  line = line.replace(/,/g, ""); // Remove commas
  line = line.replace(/[\(\{\[].*?[\)\}\]]/g, ""); // Remove names in brackets

  const parts = line.split(" ");
  const email = parts.find((part) => part.includes("@"));
  const names = parts.filter(
    (part) =>
      !part.includes("@") &&
      !TITLES.some((title) => part.toUpperCase() === title) &&
      !part.match(/^[({].*[)}]$/) // Remove names in parentheses or braces
  );

  let formattedName = "";
  if (names.length > 2) {
    const firstName = capitalizeFirstLetter(names[0]);
    const lastName = capitalizeFirstLetter(names[names.length - 1]);
    formattedName = `${firstName} ${lastName}`;
  } else {
    formattedName = names.map(capitalizeFirstLetter).join(" ");
  }

  return `${formattedName} ${email || ""}`.trim();
}

// Function to capitalize the first letter of each name
function capitalizeFirstLetter(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Function to extract the domain from the email
function extractDomain(input) {
  const email = input.split(" ").find((part) => part.includes("@"));
  if (email) {
    const domain = email.split("@")[1];
    return domain ? domain.toLowerCase().trim() : null;
  }
  return null;
}

// Function to fetch the CEO name from Firestore
async function getCEOName(domain) {
  if (!domain) return null;

  const normalizedDomain = domain.toLowerCase();
  try {
    const domainRef = doc(db, "savedData", normalizedDomain);
    const docSnap = await getDoc(domainRef);

    if (docSnap.exists()) {
      return docSnap.data().ceoNames || null; // Return CEO name if available
    }
    return null; // CEO not found
  } catch (error) {
    console.error("Error fetching CEO name:", error);
    return null; // Error fetching CEO name
  }
}

// Copy button functionality
copyBtn.addEventListener("click", () => {
  copyBtn.style.display = "none";
  const output = outputElement.textContent;
  navigator.clipboard
    .writeText(output)
    .then(() => {
      notification.textContent = "Copied to clipboard successfully!";
      notification.classList.add("show");

      setTimeout(() => {
        notification.classList.remove("show");
        domainInput.value = "";
        outputElement.textContent = "";
        copyBtn.style.display = "none";
      }, 4000);
    })
    .catch((err) => {
      console.error("Error copying text: ", err);
    });
});
