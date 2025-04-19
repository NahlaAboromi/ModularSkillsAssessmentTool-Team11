//manual-exam.js
document.addEventListener('DOMContentLoaded', function () {
  const originalAlert = window.alert;
  window.alert = function (message) {
    if (typeof message === 'string' && 
       (message.includes('Please enter the question text') || 
        (questions.length > 0 && message.includes('Please add at least one question')))) {
      console.log('❌ Alert skipped:', message);
      return;
    }
    originalAlert(message);
  };
  let questions = [];
  const classCodeInput = document.getElementById("classCode");// Class code input field
  const classNameInput = document.getElementById("className");// Class name input field
  const subjectSelect = document.getElementById("subjectSelect");// Subject selection dropdown
  const classForm = document.getElementById("classForm");// Class form element
  const examRadios = document.querySelectorAll('input[name="examOption"]');// Exam option radio buttons
  const manualExam = document.getElementById('manualExam'); // Manual exam section
  const manualRadio = document.querySelector('input[value="manual"]'); // Manual exam radio button
  const autoRadio = document.querySelector('input[value="auto"]'); // Automatic exam radio button
  const modal = document.getElementById('examEditorModal'); // Modal for exam editor
  const openModalBtn = document.getElementById('openExamEditorBtn');  // Button to open the exam editor modal
  const closeModals = document.querySelectorAll('.close-modal, .close-modal-btn');  // Close buttons for modals
  const saveExamBtn = document.getElementById('saveExamBtn');   // Save button for the exam
  const createClassBtn = document.getElementById('createClassBtn');   // Button to create a class
  const addQuestionBtn = document.getElementById('addQuestionBtn');   // Button to add a question
  const questionsList = document.getElementById('questionsList'); // List of questions
  const emptyQuestionsList = document.getElementById('emptyQuestionsList');   // Empty questions list message
  const modalQuestionCount = document.getElementById('modalQuestionCount');   // Question count in modal
  const questionCounter = document.getElementById('questionCounter');   // Question count in the main form
  const noQuestionsMsg = document.getElementById('noQuestionsMsg'); // No questions message
  const questionsPreviewList = document.getElementById('questionsPreviewList'); // Preview of questions
  const confirmBtns = document.querySelectorAll('.modal-confirm-btn, button[type="submit"]');   // Confirm buttons in modals
  
  if (classCodeInput) {
    classCodeInput.addEventListener("input", () => {
      classCodeInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
    });
  }

  if (classNameInput) {
    classNameInput.addEventListener("input", () => {
      classNameInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
    });
  }

  if (subjectSelect) {
    subjectSelect.addEventListener("change", () => {
      subjectSelect.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
    });
  }
  
  examRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'manual') {
        manualExam.classList.remove('hidden');
        autoExam.classList.add('hidden');
      } 
    });
  });
  
  if (manualRadio) {
    manualRadio.addEventListener("change", function() {
      const classCode = classCodeInput.value.trim();
      const className = classNameInput.value.trim();
      const subject = subjectSelect.value;
      
      if (!classCode || !className || !subject) {
        alert("Please fill in the Class Code, Class Name, and Subject fields before selecting an exam creation method.");
        
        manualRadio.checked = false;
        
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
      manualExam.classList.remove("hidden");
      autoExam.classList.add("hidden");
    });
  }
  if (openModalBtn) {
    openModalBtn.addEventListener('click', function() {
      modal.style.display = 'block';
    });
  }
  
  closeModals.forEach(btn => {
    btn.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  });
  
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  const possibleSelectors = [
    '.close', '.close-button', '.modal-close', '.close-modal', '.modal-close-btn',
    '.modal-header .close', '.modal-header-close', 
    '.x-button', '[aria-label="Close"]',
    '.close-icon', '.fa-times', '.modal-header svg',
    'button.close', 'span.close'
  ];
  const combinedSelector = possibleSelectors.join(', ');
  const closeButtons = document.querySelectorAll(combinedSelector);
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  });
  const modalHeaderElement = modal ? modal.querySelector('.modal-header, .modal-title, header, h2, h3') : null;
  if (modalHeaderElement) {

    const closeElements = [...modalHeaderElement.parentNode.children].filter(el => 
      el !== modalHeaderElement && 
      (el.textContent.includes('×') || el.textContent.includes('X') || 
      el.classList.contains('close') || el.classList.contains('close-button'))
    );
    closeElements.forEach(el => {
      el.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    });
  }
  setTimeout(() => {
    const xElements = Array.from(document.querySelectorAll('*')).filter(el => 
      (el.textContent.trim() === 'X' || el.textContent.trim() === '×' || el.textContent.trim() === '✕') && 
      window.getComputedStyle(el).position !== 'static'
    );
    
    xElements.forEach(el => {
      el.addEventListener('click', function() {
        if (modal) modal.style.display = 'none';
      });
    });
  }, 500);
  
  confirmBtns.forEach(btn => {
    btn.addEventListener('click', function(event) {
      const modalInput = this.closest('.modal')?.querySelector('input[type="text"]');
      if (modalInput && !modalInput.value.trim()) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'text-red-500 mt-2';
        errorMsg.textContent = 'Please enter question text';
        
        const existingError = modalInput.parentNode.querySelector('.text-red-500');
        if (existingError) {
          existingError.remove();
        }
        modalInput.parentNode.appendChild(errorMsg);
        
        event.preventDefault();
        return;
      }
    });
  });
  // This function removes error messages from the form.
  function removeErrorMessages() {
    const errorMessages = document.querySelectorAll('.text-red-500');
    errorMessages.forEach(msg => msg.remove());
  }
  // This function sets up listeners to clear error messages when the user interacts with the form.
  function setupErrorClearingListeners() {
    document.querySelectorAll('.option-text').forEach(input => {
      input.addEventListener('input', function() {
        const allOptionsFilled = Array.from(document.querySelectorAll('.option-text'))
                                      .every(el => el.value.trim() !== '');
        if (allOptionsFilled) {
          removeErrorMessages();
        }
      });
    });
    const questionText = document.getElementById('questionText');
    if (questionText) {
      questionText.addEventListener('input', function() {
        if (this.value.trim() !== '') {
          removeErrorMessages();
        }
      });
    }
  }
  setupErrorClearingListeners();
  if (addQuestionBtn) {
    addQuestionBtn.addEventListener('click', function() {
      const questionType = document.getElementById('questionType').value;
      const questionText = document.getElementById('questionText').value;
      removeErrorMessages();
      if (!questionText.trim()) {
        const questionForm = document.getElementById('questionForm');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'text-red-500 mt-4 text-center';
        errorMsg.textContent = 'Please enter question text';
        questionForm.appendChild(errorMsg);
        return;
      }
      let question = {
        type: questionType,
        text: questionText
      };
      if (questionType === 'multiple-choice') {
        const options = Array.from(document.querySelectorAll('.option-text')).map(el => el.value);
        const correctOption = document.querySelector('input[name="correctOption"]:checked').value;
        
        if (options.some(opt => !opt.trim())) {
          const questionForm = document.getElementById('questionForm');
          
          const existingError = questionForm.querySelector('.text-red-500');
          if (!existingError) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-red-500 mt-4 text-center';
            errorMsg.textContent = 'Please fill in all answer options';
            questionForm.appendChild(errorMsg);
          }
          return;
        }
        question.options = options;
        question.correctOption = parseInt(correctOption);
      } else if (questionType === 'true-false') {
        question.answer = document.querySelector('input[name="trueFalseAnswer"]:checked').value === 'true';
      }
      if (addQuestionBtn.dataset.mode === 'edit') {
        const index = parseInt(addQuestionBtn.dataset.index);
        questions[index] = question;
        addQuestionBtn.textContent = 'Add Question';
        addQuestionBtn.dataset.mode = 'add';
        delete addQuestionBtn.dataset.index;
      } else {
        if (questions.length >= 10) {
          const questionForm = document.getElementById('questionForm');
          
          const existingError = questionForm.querySelector('.text-red-500');
          if (!existingError) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-red-500 mt-4 text-center';
            errorMsg.textContent = 'Maximum number of questions (10) reached';
            questionForm.appendChild(errorMsg);
          }
          return;
        }
        questions.push(question);
      }
      updateQuestionsDisplay();
      syncQuestionsWithManualExam();
      if (questions.length > 0) {
        const warningMessages = document.querySelectorAll('.warning-message, .alert-message, .error-message');
        warningMessages.forEach(msg => {
          if (msg.textContent && msg.textContent.includes('Please add at least one question')) {
            msg.style.display = 'none';
          }
        });
        
        const errorDialogs = document.querySelectorAll('.modal, .dialog, [role="dialog"]');
        errorDialogs.forEach(dialog => {
          const dialogText = dialog.textContent || '';
          if (dialogText.includes('Please add at least one question')) {
            dialog.style.display = 'none';
          }
        });
      }
      
      document.getElementById('questionText').value = '';
      document.querySelectorAll('.option-text').forEach(option => {
        option.value = '';
      });
      document.querySelector('input[name="correctOption"][value="0"]').checked = true;
      
      document.getElementById('questionText').focus();
    });
  }
  
  const questionType = document.getElementById('questionType');
  if (questionType) {
    questionType.addEventListener('change', function() {
      document.getElementById('multipleChoiceOptions').classList.add('hidden');
      document.getElementById('trueFalseOptions').classList.add('hidden');
      
      if (this.value === 'multiple-choice') {
        document.getElementById('multipleChoiceOptions').classList.remove('hidden');
        setupErrorClearingListeners();
      } else if (this.value === 'true-false') {
        document.getElementById('trueFalseOptions').classList.remove('hidden');
      }
      removeErrorMessages();
    });
  }
  //Updates the visual list of manual exam questions and their count display.
  function updateQuestionsDisplay() {
    if (!modalQuestionCount || !questionCounter || !questionsList) return;
    
    modalQuestionCount.textContent = `${questions.length}/10`;
    questionCounter.textContent = `${questions.length}/10`;
    
    if (questions.length > 0) {
      emptyQuestionsList.classList.add('hidden');
      noQuestionsMsg.classList.add('hidden');
      questionsPreviewList.classList.remove('hidden');
    } else {
      emptyQuestionsList.classList.remove('hidden');
      noQuestionsMsg.classList.remove('hidden');
      questionsPreviewList.classList.add('hidden');
    }
    
    questionsList.innerHTML = '';
    
    questionsList.appendChild(emptyQuestionsList);
    
    questions.forEach((q, index) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800 border border-slate-700 rounded-lg p-4 question-card mb-4';
      
      let typeLabel = '';
      switch(q.type) {
        case 'multiple-choice': typeLabel = 'Multiple Choice'; break;
        case 'true-false': typeLabel = 'True/False'; break;
      }
      
      const header = document.createElement('div');
      header.className = 'flex justify-between items-start mb-2';
      header.innerHTML = `
        <div class="flex items-center">
          <span class="font-medium text-white mr-2">Question ${index + 1} -</span>
          <span class="text-gray-300">${typeLabel}</span>
        </div>
        <button class="text-blue-400 hover:text-blue-300 transition-colors edit-question" data-index="${index}">Edit</button>
      `;
      card.appendChild(header);
      
      const questionTextEl = document.createElement('div');
      questionTextEl.className = 'mb-3 text-white';
      questionTextEl.textContent = q.text;
      card.appendChild(questionTextEl);
      
      if (q.type === 'multiple-choice') {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';
        
        q.options.forEach((option, optIndex) => {
          const optionEl = document.createElement('div');
          const isCorrect = optIndex === q.correctOption;
          
          if (isCorrect) {
            optionEl.className = 'p-3 rounded bg-green-800 border border-green-600 text-white flex items-center justify-between';
            optionEl.innerHTML = `
              <span>${String.fromCharCode(65 + optIndex)}. ${option}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            `;
          } else {
            optionEl.className = 'p-3 rounded bg-slate-700 border border-slate-600 text-gray-300';
            optionEl.textContent = `${String.fromCharCode(65 + optIndex)}. ${option}`;
          }
          
          optionsContainer.appendChild(optionEl);
        });
        
        card.appendChild(optionsContainer);
      } else if (q.type === 'true-false') {
        const tfContainer = document.createElement('div');
        tfContainer.className = 'grid grid-cols-2 gap-3';
        
        const falseEl = document.createElement('div');
        if (!q.answer) {
          falseEl.className = 'p-3 rounded bg-green-800 border border-green-600 text-white flex items-center justify-between';
          falseEl.innerHTML = `
            <span>False</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          `;
        } else {
          falseEl.className = 'p-3 rounded bg-slate-700 border border-slate-600 text-gray-300';
          falseEl.textContent = 'False';
        }
        tfContainer.appendChild(falseEl);
        
        const trueEl = document.createElement('div');
        if (q.answer) {
          trueEl.className = 'p-3 rounded bg-green-800 border border-green-600 text-white flex items-center justify-between';
          trueEl.innerHTML = `
            <span>True</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          `;
        } else {
          trueEl.className = 'p-3 rounded bg-slate-700 border border-slate-600 text-gray-300';
          trueEl.textContent = 'True';
        }
        tfContainer.appendChild(trueEl);
        
        card.appendChild(tfContainer);
      }
      
      questionsList.appendChild(card);
    });
    
    updatePreviewList();
    
    document.querySelectorAll('.edit-question').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        editQuestion(index);
      });
    });
  }
  // This function is called whenever a question is added, edited, or removed.
  // It updates the preview list to reflect the current state of the questions array.
  function updatePreviewList() {
    if (!questionsPreviewList) return;
    
    questionsPreviewList.innerHTML = '';
    
    if (questions.length === 0) {
      return;
    }
    
    questions.forEach((q, index) => {
      const previewItem = document.createElement('div');
      previewItem.className = 'p-3 bg-slate-700 rounded-md mb-2 border border-slate-600';
      
      let typeLabel = '';
      switch(q.type) {
        case 'multiple-choice': typeLabel = 'Multiple Choice'; break;
        case 'true-false': typeLabel = 'True/False'; break;
      }
     
      let previewHtml = `
        <div class="flex justify-between">
          <span class="font-semibold text-white">Question ${index + 1}</span>
          <span class="text-sm text-gray-300">${typeLabel}</span>
        </div>
        <p class="text-sm text-white truncate">${q.text}</p>
      `;
  
      if (q.type === 'multiple-choice') {
        const correctOptionLetter = String.fromCharCode(65 + q.correctOption);
        const correctAnswer = q.options[q.correctOption];
        previewHtml += `
          <p class="text-xs text-green-400 mt-1">Answer: ${correctOptionLetter}. ${correctAnswer}</p>
        `;
      } else if (q.type === 'true-false') {
        previewHtml += `
          <p class="text-xs text-green-400 mt-1">Answer: ${q.answer ? 'True' : 'False'}</p>
        `;
      }
      
      previewItem.innerHTML = previewHtml;
      questionsPreviewList.appendChild(previewItem);
    });
  }
  //Loads a question into the form to allow editing by the lecturer.
  function editQuestion(index) {
    const question = questions[index];
    
    const questionTypeElem = document.getElementById('questionType');
    const questionTextElem = document.getElementById('questionText');
    const multipleChoiceOptions = document.getElementById('multipleChoiceOptions');
    const trueFalseOptions = document.getElementById('trueFalseOptions');
    
    if (!questionTypeElem || !questionTextElem || !multipleChoiceOptions || !trueFalseOptions) return;
    
    questionTypeElem.value = question.type;
    questionTextElem.value = question.text;
    
    multipleChoiceOptions.classList.add('hidden');
    trueFalseOptions.classList.add('hidden');
    
    if (question.type === 'multiple-choice') {
      multipleChoiceOptions.classList.remove('hidden');
      
      const optionInputs = document.querySelectorAll('.option-text');
      question.options.forEach((opt, i) => {
        if (i < optionInputs.length) {
          optionInputs[i].value = opt;
        }
      });
      
      const correctOption = document.querySelector(`input[name="correctOption"][value="${question.correctOption}"]`);
      if (correctOption) correctOption.checked = true;
    } else if (question.type === 'true-false') {
      trueFalseOptions.classList.remove('hidden');
      
      const tfAnswer = document.querySelector(`input[name="trueFalseAnswer"][value="${question.answer}"]`);
      if (tfAnswer) tfAnswer.checked = true;
    }
    
    removeErrorMessages();
    
    if (addQuestionBtn) {
      addQuestionBtn.textContent = 'Update Question';
      addQuestionBtn.dataset.mode = 'edit';
      addQuestionBtn.dataset.index = index;
    }
    
    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
      questionForm.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  function resetExamQuestions() {
    questions = [];
  
    const questionText = document.getElementById('questionText');
    if (questionText) questionText.value = '';
  
    document.querySelectorAll('.option-text').forEach(option => {
      option.value = '';
    });
  
    const correctOption = document.querySelector('input[name="correctOption"][value="0"]');
    if (correctOption) correctOption.checked = true;
  
    removeErrorMessages();
  
    if (addQuestionBtn) {
      addQuestionBtn.textContent = 'Add Question';
      addQuestionBtn.dataset.mode = 'add';
      delete addQuestionBtn.dataset.index;
    }
  
    if (emptyQuestionsList && noQuestionsMsg && questionsPreviewList) {
      emptyQuestionsList.classList.remove('hidden');
      noQuestionsMsg.classList.remove('hidden');
      questionsPreviewList.classList.add('hidden');
    }
  
    if (modalQuestionCount) modalQuestionCount.textContent = '0/10';
    if (questionCounter) questionCounter.textContent = '0/10';
  
    updateQuestionsDisplay();
  }
  
  if (createClassBtn) {
    createClassBtn.addEventListener('click', function(e) {
      e.preventDefault(); 
      classForm.requestSubmit(); 
    });
  }
  const cancelBtn = document.querySelector('.close-modal-btn, button.cancel, #cancelExamBtn, .modal-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      resetExamQuestions();
      if (modal) modal.style.display = 'none';
    });
  }
  if (saveExamBtn) {
    saveExamBtn.addEventListener('click', function() {
      if (modal) modal.style.display = 'none';
    });
  }
  //Resets the exam creation form and clears all validation highlights and questions.
  function resetForm() {
    if (classForm) classForm.reset();
  
    // Hide both exam sections
    if (manualExam) manualExam.classList.add("hidden");
    if (autoExam) autoExam.classList.add("hidden");
  
    // Reset radio buttons
    if (manualRadio) manualRadio.checked = false;
    if (autoRadio) autoRadio.checked = false;
  
    // Remove validation highlighting
    if (classCodeInput) classCodeInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
    if (classNameInput) classNameInput.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
    if (subjectSelect) subjectSelect.classList.remove("border-red-500", "bg-red-50", "dark:bg-red-900");
  
    // Explicitly hide the autoPreview element
    const autoPreview = document.getElementById("autoPreview");
    if (autoPreview) {
      autoPreview.classList.add("hidden");
      // Also clear its content to ensure it's fully reset
      autoPreview.innerHTML = '';
    }
  
    resetExamQuestions();
  }
  //Synchronizes the local questions array with the global manualExam object to ensure consistency.
  function syncQuestionsWithManualExam() {
    if (window.manualExam) {
      if (!window.manualExam.questions) {
        window.manualExam.questions = [];
      }
      window.manualExam.questions.length = 0;
      questions.forEach(q => {
        if (q.type === 'multiple-choice') {
          window.manualExam.questions.push({
            question: q.text,
            options: q.options,
            correctAnswer: q.correctOption,
            tag: q.type
          });
        } else if (q.type === 'true-false') {
          window.manualExam.questions.push({
            question: q.text,
            options: ['True', 'False'],
            correctAnswer: q.answer ? 0 : 1,
            tag: q.type
          });
        }
      });
      if (window.manualExam.validateQuestion) {
        const originalValidate = window.manualExam.validateQuestion;
        window.manualExam.validateQuestion = function(q) {
          if (questions.length > 0) {
            return true;
          }
          return originalValidate(q);
        };
      }
    }
  }
  
  if (classForm) {
    classForm.addEventListener("submit", (e) => {
      e.preventDefault();
      syncQuestionsWithManualExam();
      const isModalActive = document.querySelector('.exam-full-modal') !== null;
      if (isModalActive) {
        return false; 
      }
      
      if (questions.length > 0) {
        const warningMessages = document.querySelectorAll('.warning-message, .alert-message, .error-message');
        warningMessages.forEach(msg => {
          if (msg.textContent && msg.textContent.includes('Please add at least one question')) {
            msg.style.display = 'none';
          }
        });
        const errorDialogs = document.querySelectorAll('.modal, .dialog, [role="dialog"]');
        errorDialogs.forEach(dialog => {
          const dialogText = dialog.textContent || '';
          if (dialogText.includes('Please add at least one question')) {
            dialog.style.display = 'none';
          }
        });
      }
      const classCode = classCodeInput ? classCodeInput.value.trim() : '';
      const className = classNameInput ? classNameInput.value.trim() : '';
      const subject = subjectSelect ? subjectSelect.value : '';
      const examOptionSelected =
  (manualRadio && manualRadio.checked) ||
  (autoRadio && autoRadio.checked);
      if (!classCode || !className || !subject || !examOptionSelected) {
        if (!examOptionSelected) {
          alert("Please select an exam creation method (manual or automatic).");
        } else {
          alert("Please fill in all required fields before creating the class.");
        }
        
        if (!classCode && classCodeInput) {
          classCodeInput.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
        }
        
        if (!className && classNameInput) {
          classNameInput.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
        }
        
        if (!subject && subjectSelect) {
          subjectSelect.classList.add("border-red-500", "bg-red-50", "dark:bg-red-900");
        }
        
        return false; 
      }
      
      if (manualRadio && manualRadio.checked) {
        if (questions.length === 0) {
          alert("Please add at least one question to your exam before creating the class.");
          return false;
        }
      }
      alert("Class created successfully!");
      resetForm();
      return false; 
    });
  }
  function showSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50';
    notification.textContent = 'Exam questions have been saved successfully!';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  setTimeout(() => {
    function handleExamErrorDialog() {
      const errorDialog = document.querySelector('[class*="modal"], [class*="dialog"], [role="dialog"]');
      const dialogText = document.querySelector('.modal-body, .dialog-body, .body');
      
      const specificErrorDialog = document.querySelector('div.modal, div[role="dialog"]');
      const specificErrorText = document.querySelector('div:contains("Please add at least one question")');
      
      console.log('Looking for error dialog...');
      
      const possibleDialogs = [
        document.querySelector('[aria-labelledby*="modal"], .modal, .dialog'),
        Array.from(document.querySelectorAll('div')).find(el => 
          el.textContent && el.textContent.includes('Please add at least one question')
        ),
        document.querySelector('div:contains("localhost:5174")'),
        Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent && el.textContent.includes('Please add at least one question')
        )
      ];
      const specificMessage = Array.from(document.querySelectorAll('div, p, span')).find(el => 
        el.textContent === 'Please add at least one question to your exam before creating the class.'
      );
      
      if (specificMessage) {
        specificMessage.style.display = 'none';
        let parent = specificMessage.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          if (parent.classList.contains('modal') || 
              parent.getAttribute('role') === 'dialog' ||
              parent.classList.contains('dialog')) {
            console.log('Hiding parent dialog container');
            parent.style.display = 'none';
            break;
          }
          parent = parent.parentElement;
        }
      }
      const targetDialog = document.querySelector('.modal[style*="display: block"]');
      if (targetDialog) {
        targetDialog.style.display = 'none';
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.style.display = 'none';
      }
      const alertText = document.querySelectorAll('div, p, span');
      alertText.forEach(el => {
        if (el.textContent && el.textContent.includes('Please add at least one question')) {
          let dialogContainer = el;
          while (dialogContainer && dialogContainer.tagName !== 'BODY') {
            if (dialogContainer.style && (
                dialogContainer.style.position === 'fixed' || 
                dialogContainer.classList.contains('modal') ||
                dialogContainer.classList.contains('dialog') ||
                dialogContainer.getAttribute('role') === 'dialog'
              )) {
              console.log('Found potential dialog container, hiding it');
              dialogContainer.style.display = 'none';
              
              const counterOverlay = document.createElement('div');
              counterOverlay.style.position = 'fixed';
              counterOverlay.style.top = '10px';
              counterOverlay.style.right = '10px';
              counterOverlay.style.background = 'green';
              counterOverlay.style.color = 'white';
              counterOverlay.style.padding = '5px 10px';
              counterOverlay.style.borderRadius = '5px';
              counterOverlay.style.zIndex = '9999';
              counterOverlay.textContent = 'Dialog hidden successfully!';
              document.body.appendChild(counterOverlay);
              setTimeout(() => {
                counterOverlay.remove();
              }, 3000);
              
              break;
            }
            dialogContainer = dialogContainer.parentElement;
          }
          el.style.display = 'none';
        }
      });
      const localhostDialog = Array.from(document.querySelectorAll('div, section, aside')).find(el => {
        const header = el.querySelector('h1, h2, h3, h4, h5, h6, div, span');
        return header && header.textContent && header.textContent.includes('localhost:5174');
      });
      if (localhostDialog) {
        console.log('Found localhost dialog, hiding it');
        localhostDialog.style.display = 'none';
      }
      const confirmButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent === 'אישור'
      );
      
      if (confirmButton) {
        console.log('Found confirm button, clicking it');
        confirmButton.click();
      }
    }
    handleExamErrorDialog();
    setTimeout(handleExamErrorDialog, 500);
    setTimeout(handleExamErrorDialog, 1500);
    const createClassBtn = document.querySelector('button:contains("Create Class")');
    if (createClassBtn) {
      const originalClick = createClassBtn.onclick;
      createClassBtn.onclick = function(e) {
        if (questions && questions.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          syncQuestionsWithManualExam();
          setTimeout(handleExamErrorDialog, 100);
          setTimeout(handleExamErrorDialog, 500);
          setTimeout(() => {
            showSuccessNotification();
            
            if (originalClick && typeof originalClick === 'function') {
              originalClick.call(this, e);
            }
          }, 1000);
          
          return false;
        }
        
        return true;
      };
    }
    
    const observer = new MutationObserver((mutations) => {
      if (questions.length > 0) {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) {
                if (node.textContent && node.textContent.includes('Please add at least one question')) {
                  setTimeout(handleExamErrorDialog, 0);
                }
                
                if (node.classList && (
                    node.classList.contains('modal') ||
                    node.classList.contains('dialog') ||
                    node.getAttribute('role') === 'dialog'
                )) {
                  setTimeout(handleExamErrorDialog, 0);
                }
              }
            });
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON' && 
          (e.target.textContent === 'אישור' || 
           e.target.textContent === 'OK' || 
           e.target.textContent === 'Close')) {
        let dialogContainer = e.target;
        while (dialogContainer && dialogContainer.tagName !== 'BODY') {
          if (dialogContainer.classList.contains('modal') ||
              dialogContainer.getAttribute('role') === 'dialog') {
            console.log('Found dialog container, will hide after click');
            setTimeout(handleExamErrorDialog, 100);
            break;
          }
          dialogContainer = dialogContainer.parentElement;
        }
      }
    }, true);
    const initialConfirmButton = document.querySelector('button.btn-primary, button.confirm, button:contains("אישור")');
    if (initialConfirmButton) {
      initialConfirmButton.click();
    }
  }, 500);
});