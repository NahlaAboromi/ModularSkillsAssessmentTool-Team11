// AutoExam.js - כל לוגיקת המבחן האוטומטי
document.addEventListener("DOMContentLoaded", function() {
  // Form elements
  const classCodeInput = document.getElementById("classCode");
  const classNameInput = document.getElementById("className");
  const subjectSelect = document.getElementById("subjectSelect");
  const difficultySelect = document.getElementById("difficultySelect");
  const autoRadio = document.querySelector('input[value="auto"]');
  const autoPreview = document.getElementById("autoPreview");
  const manualSection = document.getElementById("manualExam");
  const autoSection = document.getElementById("autoExam");

  // פונקציה לבדיקת שדות חובה
  function validateRequiredFields() {
    // בדיקה אם כל שדות החובה מלאים
    const classCode = classCodeInput.value.trim();
    const className = classNameInput.value.trim();
    const subject = subjectSelect.value;
    
    if (!classCode || !className || !subject) {
      // הצגת הודעת שגיאה
      alert("Please fill in the Class Code, Class Name, and Subject fields before selecting an exam creation method.");
      
      // ביטול בחירת הכפתור
      autoRadio.checked = false;
      
      // הסתרת אזור המבחן אם היה גלוי
      autoSection.classList.add("hidden");
      
      // הדגשת שדות ריקים
      if (!classCode) {
        classCodeInput.classList.add("border-red-500");
        classCodeInput.classList.add("bg-red-50");
        classCodeInput.classList.add("dark:bg-red-900");
      }
      
      if (!className) {
        classNameInput.classList.add("border-red-500");
        classNameInput.classList.add("bg-red-50");
        classNameInput.classList.add("dark:bg-red-900");
      }
      
      if (!subject) {
        subjectSelect.classList.add("border-red-500");
        subjectSelect.classList.add("bg-red-50");
        subjectSelect.classList.add("dark:bg-red-900");
      }
      
      return false;
    }
    
    // הסרת הדגשות שגיאה קודמות
    classCodeInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
    classNameInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
    subjectSelect.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
    
    return true;
  }

  // תצוגת המבחן המוצע המשופרת
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

        // הצגת מיכל והכפתור
        autoPreview.classList.remove("hidden");
        
        // יצירת מיכל אטרקטיבי יותר
        autoPreview.innerHTML = '';
        
        // יצירת כרטיס מידע מעוצב
        const infoCard = document.createElement("div");
        infoCard.className = "mt-4 p-4 bg-slate-700 border border-slate-600 rounded-lg";
        
        const infoTitle = document.createElement("div");
        infoTitle.className = "text-lg font-semibold mb-2";
        infoTitle.textContent = exam.title || `${subject.charAt(0).toUpperCase() + subject.slice(1)} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Exam`;
        
        const infoDetails = document.createElement("div");
        infoDetails.className = "text-gray-300 mb-3";
        infoDetails.innerHTML = `
          <div class="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Number of Questions: <strong>${exam.questions.length}</strong></span>
          </div>
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Difficulty: <strong>${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</strong></span>
          </div>
        `;
        
        infoCard.appendChild(infoTitle);
        infoCard.appendChild(infoDetails);
        
        // יצירת כפתור משופר - עם type="button" כדי שלא יגרום לשליחת הטופס
        const viewFullExamBtn = document.createElement("button");
        viewFullExamBtn.id = "viewFullExamBtn";
        viewFullExamBtn.type = "button"; // החשוב ביותר - מונע שליחת הטופס
        viewFullExamBtn.className = "mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded transition-all flex items-center justify-center gap-2";
        viewFullExamBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>View Full Exam</span>
        `;
        
        infoCard.appendChild(viewFullExamBtn);
        autoPreview.appendChild(infoCard);
        
        // הגדרת פונקציה לתצוגת המבחן המלא בעת לחיצה על הכפתור
        viewFullExamBtn.addEventListener('click', function(event) {
          // מניעת התנהגות ברירת מחדל שעלולה לגרום לכפתור להשתמש באירועים אחרים
          event.preventDefault();
          event.stopPropagation();
          
          // הצגת המבחן המלא
          showFullExam(exam);
          
          // מניעת המשך הפרופגציה של האירוע למניעת התנגשויות
          return false;
        });
      })
      .catch(err => console.error("Failed to load exam data:", err));
  }

  // תצוגת המבחן המלא עם עיצוב משופר
  function showFullExam(exam) {
    // בדיקה אם כבר קיים מודל פתוח - למניעת כפילויות
    const existingModal = document.querySelector('.exam-full-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // יצירת מיכל מודל
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/70 exam-full-modal";
    modal.style.backdropFilter = "blur(3px)";
    
    // יצירת תוכן מודל
    const modalContent = document.createElement("div");
    modalContent.className = "bg-slate-800 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col overflow-hidden";
    
    // יצירת כותרת
    const header = document.createElement("div");
    header.className = "bg-slate-700 px-6 py-4 border-b border-slate-600 flex justify-between items-center";
    
    const title = document.createElement("h2");
    title.className = "font-bold text-xl";
    title.textContent = exam.title || `${subjectSelect.value.charAt(0).toUpperCase() + subjectSelect.value.slice(1)} - ${difficultySelect.value.charAt(0).toUpperCase() + difficultySelect.value.slice(1)} Exam`;
    
    const closeBtn = document.createElement("button");
    closeBtn.type = "button"; // חשוב - מונע שליחת טופס
    closeBtn.className = "text-gray-300 hover:text-white transition-colors";
    closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    modalContent.appendChild(header);
    
    // יצירת גוף עם גלילה לשאלות
    const body = document.createElement("div");
    body.className = "flex-1 overflow-y-auto px-6 py-4";
    
    // יצירת שאלות
    exam.questions.forEach((q, i) => {
      const questionEl = document.createElement("div");
      questionEl.className = "bg-slate-700 rounded-lg p-4 mb-4 shadow-sm";
      
      const questionHeader = document.createElement("div");
      questionHeader.className = "flex items-start mb-3";
      questionHeader.innerHTML = `
        <span class="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm shrink-0 mt-0.5">${i + 1}</span>
        <span class="font-medium">${q.question}</span>
      `;
      questionEl.appendChild(questionHeader);
      
      // מיכל אפשרויות עם פריסת רשת
      const optionsContainer = document.createElement("div");
      optionsContainer.className = "grid grid-cols-1 gap-2 ml-10 md:grid-cols-2";
      
      // הוספת כל האפשרויות
      q.options.forEach((opt, j) => {
        const isCorrect = opt === q.correctAnswer;
        const optionEl = document.createElement("div");
        optionEl.className = `rounded p-3 flex items-center ${isCorrect ? 'bg-green-800/70 border border-green-700' : 'bg-slate-600 border border-slate-500'}`;
        
        const letter = String.fromCharCode(65 + j); // A, B, C, D...
        
        if (isCorrect) {
          optionEl.innerHTML = `
            <span class="mr-2 font-medium">${letter}.</span>
            <span>${opt}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          `;
        } else {
          optionEl.innerHTML = `
            <span class="mr-2 font-medium">${letter}.</span>
            <span>${opt}</span>
          `;
        }
        
        optionsContainer.appendChild(optionEl);
      });
      
      questionEl.appendChild(optionsContainer);
      body.appendChild(questionEl);
    });
    
    modalContent.appendChild(body);
    
    // יצירת כותרת תחתונה
    const footer = document.createElement("div");
    footer.className = "bg-slate-700 px-6 py-4 border-t border-slate-600";
    
    const returnBtn = document.createElement("button");
    returnBtn.type = "button"; // חשוב - מונע שליחת טופס
    returnBtn.className = "bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-medium transition-colors";
    returnBtn.textContent = "Return";
    
    footer.appendChild(returnBtn);
    modalContent.appendChild(footer);
    
    // הוספה למודל והוספה לגוף המסמך
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // סגירה בלחיצה על כפתור
    returnBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      document.body.removeChild(modal);
      return false;
    };
    
    // סגירה בלחיצה על כפתור X
    closeBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      document.body.removeChild(modal);
      return false;
    };
    
    // סגירה בלחיצה מחוץ לתוכן המודל
    modal.addEventListener("click", function(e) {
      if (e.target === modal) {
        e.preventDefault();
        e.stopPropagation();
        document.body.removeChild(modal);
        return false;
      }
    });
  }

  // מאזיני אירועים להצעת המבחן
  subjectSelect.addEventListener("change", showSuggestedExam);
  difficultySelect.addEventListener("change", showSuggestedExam);

  // אתחול מאזין אירועים ליצירת מבחן אוטומטי
  autoRadio.addEventListener("change", function() {
    if (!validateRequiredFields()) {
      return; // עצירה אם האימות נכשל
    }
    
    autoSection.classList.remove("hidden");
    manualSection.classList.add("hidden");
    showSuggestedExam();
  });
});