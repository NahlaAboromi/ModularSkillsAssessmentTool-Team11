const classCodeInput = document.getElementById("classCode");
const classNameInput = document.getElementById("className");
const subjectSelect = document.getElementById("subjectSelect");
const difficultySelect = document.getElementById("difficultySelect");
const autoRadio = document.querySelector('input[value="auto"]');
const autoPreview = document.getElementById("autoPreview");
const autoSection = document.getElementById("autoExam");
const questionFields = document.getElementById("questionFields");
const viewBtn = document.getElementById("viewFullExamBtn");
const themeBtn = document.getElementById("btnTheme");

// Function to validate required fields
function validateRequiredFields() {
  const classCode = classCodeInput.value.trim();
  const className = classNameInput.value.trim();
  const subject = subjectSelect.value;

  if (!classCode || !className || !subject) {
    alert("Please fill in the Class Code, Class Name, and Subject fields before selecting an exam creation method.");
    autoRadio.checked = false;
    autoSection.classList.add("hidden");

    if (!classCode) {
      classCodeInput.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
    }

    if (!className) {
      classNameInput.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
    }

    if (!subject) {
      subjectSelect.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
    }

    return false;
  }

  classCodeInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
  classNameInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
  subjectSelect.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");

  return true;
}

// Show suggested exam after selecting subject + difficulty
function showSuggestedExam() {
  if (!autoRadio.checked) return;

  const subject = subjectSelect.value;
  const difficulty = difficultySelect.value;
  if (!subject || !difficulty) return;

  fetch("all-exams.json")
    .then(res => res.json())
    .then(examData => {
      const exam = examData[subject]?.[difficulty];
      if (!exam) return;

      autoPreview.classList.remove("hidden");
      viewBtn.classList.remove("hidden");
      viewBtn.className = "mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700";
      
      viewBtn.onclick = () => showFullExam(exam);
    })
    .catch(err => console.error("Failed to load exam data:", err));
}

// Show exam content in modal
function showFullExam(exam) {
  let modalContent = `
    <div style="background-color: #1e293b; color: white; padding: 24px; border-radius: 12px; max-height: 80vh; overflow-y: auto;">
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 16px; border-bottom: 2px solid #334155;">${exam.title}</h2>
  `;

  exam.questions.forEach((q, i) => {
    modalContent += `
      <div style="margin-bottom: 20px; padding: 10px; background-color: #334155; border-radius: 8px;">
        <p style="font-weight: bold;">Question ${i + 1}: <span style="font-weight: normal;">${q.question}</span></p>
        <ul style="list-style-type: disc; padding-left: 20px; margin-top: 8px;">
          ${q.options
            .map(opt => `<li style="color: ${opt === q.correctAnswer ? '#22c55e' : 'white'}; font-weight: ${opt === q.correctAnswer ? 'bold' : 'normal'}">${opt}</li>`)
            .join("")}
        </ul>
      </div>
    `;
  });

  modalContent += `
    <div style="text-align: right; margin-top: 24px;">
      <button id="backButton" style="background-color: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">Back</button>
    </div>
  </div>`;

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  const modalBox = document.createElement("div");
  modalBox.innerHTML = modalContent;
  modal.appendChild(modalBox);
  document.body.appendChild(modal);

  document.getElementById("backButton").onclick = () => {
    document.body.removeChild(modal);
  };
}

// Remove highlight on user input
classCodeInput.addEventListener("input", () => {
  classCodeInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
});
classNameInput.addEventListener("input", () => {
  classNameInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
});
subjectSelect.addEventListener("change", () => {
  subjectSelect.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
  showSuggestedExam();
});

// Listeners for dropdowns
subjectSelect.addEventListener("change", showSuggestedExam);
difficultySelect.addEventListener("change", showSuggestedExam);

// Auto exam radio toggle
autoRadio.addEventListener("change", () => {
  if (!validateRequiredFields()) return;

  autoSection.classList.remove("hidden");
  showSuggestedExam();
});

// Theme toggle
themeBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  themeBtn.textContent = document.documentElement.classList.contains("dark") ? "Light" : "Dark";
});

// Form submission
document.getElementById("classForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const classCode = classCodeInput.value.trim();
  const className = classNameInput.value.trim();
  const subject = subjectSelect.value;

  if (!classCode || !className || !subject || !autoRadio.checked) {
    alert("Please fill in all required fields and select automatic exam creation.");

    if (!classCode) {
      classCodeInput.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
    }
    if (!className) {
      classNameInput.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
    }
    if (!subject) {
      subjectSelect.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
    }

    return;
  }

  if (!difficultySelect.value) {
    alert("Please select a difficulty level for the auto-generated exam.");
    return;
  }

  alert("Class created successfully!");
});
