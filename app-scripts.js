// Initialize global variables
let students = { students: [] };
let quizzes = {}; // To store quiz data
let progressChart = null; // Global variable to store the chart instance

// Fetch students data from the JSON file
async function loadStudentData() {
  try {
    const response = await fetch('student-data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    students = await response.json();
    console.log("Student data loaded successfully:", students);
    return students;
  } catch (error) {
    console.error("Error loading student data:", error);
    return null;
  }
}

// Fetch quizzes data from the JSON file
async function loadQuizData() {
  try {
    const response = await fetch('quizzes-data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    quizzes = await response.json();
    console.log("Quiz data loaded successfully:", quizzes);
    return quizzes;
  } catch (error) {
    console.error("Error loading quiz data:", error);
    return null;
  }
}

// Initialize the application
async function initApp() {
  try {
    // Load data in parallel
    await Promise.all([loadStudentData(), loadQuizData()]);
    
    // If we're on the dashboard page, initialize it
    if (document.getElementById('skill-map')) {
      initDashboard();
    }
  } catch (error) {
    console.error("Error initializing app:", error);
    alert("There was an error loading the application data. Please try refreshing the page.");
  }
}

// Initialize the dashboard
function initDashboard() {
  // Get logged in user
  let loggedInUser = null;
  
  try {
    const storedUser = sessionStorage.getItem("loggedInUser");
    if (storedUser) {
      loggedInUser = JSON.parse(storedUser);
      console.log("Retrieved from sessionStorage:", loggedInUser);
      
      // Update user name in header if available
      const userNameElement = document.getElementById("user-name");
      if (userNameElement && loggedInUser.name) {
        userNameElement.textContent = `Welcome, ${loggedInUser.name}`;
      }
    } else {
      console.error("No user data found in sessionStorage.");
      alert("You must log in first.");
      window.location.replace("login-register.html");
      return;
    }
  } catch (error) {
    console.error("Error parsing loggedInUser from sessionStorage:", error);
    alert("There was an error with your session. Please log in again.");
    window.location.replace("login-register.html");
    return;
  }
  
  // Load the dashboard for the logged-in user
  loadDashboard(loggedInUser);
}

// Register Functionality
document.getElementById("register-form")?.addEventListener("submit", function(e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value.trim();

  // Check if email already exists
  const emailExists = students.students.some(student => student.email === email);
  if (emailExists) {
    alert("This email is already registered. Please use a different email.");
    return;
  }

  // Add new student to the fake database
  const newStudent = {
    id: students.students.length + 1,
    name: name,
    email: email,
    password: password,
    classes: [
      {
        className: "Mathematics",
        performance: {
          quizzes: [],
          assignments: []
        }
      },
      {
        className: "Physics",
        performance: {
          quizzes: [],
          assignments: []
        }
      },
      {
        className: "Computer Science",
        performance: {
          quizzes: [],
          assignments: []
        }
      }
    ]
  };
  students.students.push(newStudent);

  // In a real app, we would save to backend here
  console.log("Updated student data:", students);

  // Clear form
  document.getElementById("register-form").reset();

  // Success message and auto-login
  alert("Registration successful! You will be logged in automatically.");
  
  // Store user data in sessionStorage
  sessionStorage.setItem("loggedInUser", JSON.stringify(newStudent));
  
  // Redirect to dashboard
  window.location.href = "dashboard.html";
});

// Login Functionality
document.getElementById("login-form")?.addEventListener("submit", function(e) {
  e.preventDefault();

  // Get form values
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  // Find user in the database
  const user = students.students.find(student => student.email === email && student.password === password);
  if (user) {
    alert(`Welcome back, ${user.name}!`);
    console.log("User logged in:", user);

    // Store user data in sessionStorage
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    
    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid login details. Please try again.");
  }

  // Clear form
  document.getElementById("login-form").reset();
});

// Function to load the dashboard for a specific user
function loadDashboard(user) {
  console.log("Loading dashboard for:", user);

  // Check if user has classes data
  if (!user.classes || user.classes.length === 0) {
    console.error("User has no classes data");
    return;
  }

  // Skill Map Section
  const skillCardsContainer = document.getElementById("skill-cards");
  if (skillCardsContainer) {
    skillCardsContainer.innerHTML = ""; // Clear existing content
    
    user.classes.forEach(cls => {
      // Handle empty performance data
      if (!cls.performance || !cls.performance.quizzes || !cls.performance.assignments) {
        cls.performance = {
          quizzes: [],
          assignments: []
        };
      }
      
      // Calculate average score
      const totalScores = [
        ...cls.performance.quizzes,
        ...cls.performance.assignments
      ];
      
      const averageScore = totalScores.length > 0
        ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length
        : 0;

      const color = averageScore >= 80 ? "bg-green-500" : averageScore >= 50 ? "bg-yellow-500" : "bg-red-500";

      skillCardsContainer.innerHTML += `
        <div class="p-4 rounded-lg ${color} text-white text-center">
          <h3 class="font-bold">${cls.className}</h3>
          <p>Average Score: ${averageScore.toFixed(2)}%</p>
          <button class="mt-2 bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700" onclick="loadQuiz('${cls.className}')">Take Quiz</button>
        </div>
      `;
    });
  }

  // Progress Tracking Section
  const ctx = document.getElementById("progress-chart")?.getContext("2d");
  if (ctx) {
    // Destroy the existing chart instance if it exists
    if (progressChart) {
      progressChart.destroy();
    }
    
 // Progress Tracking Section
const ctx = document.getElementById("progress-chart")?.getContext("2d");
if (ctx) {
  // Destroy the existing chart instance if it exists
  if (progressChart) {
    progressChart.destroy();
  }

  // Prepare datasets for the chart
  const datasets = user.classes.map(cls => {
    // Limit quiz scores to a maximum of 4 quizzes
    const scores = cls.performance?.quizzes?.slice(0, 4) || [0, 0, 0, 0]; // Default placeholders if no quizzes exist

    return {
      label: cls.className,
      data: scores, // Use only the first 4 quiz scores
      borderColor: getRandomColor(),
      borderWidth: 2,
      fill: false,
      tension: 0.1,
    };
  });

  // Find the maximum number of quizzes across all classes, capped at 4
  const maxQuizzes = Math.min(
    Math.max(...user.classes.map(cls => cls.performance?.quizzes?.length || 0)), // Maximum quizzes taken by any class
    4 // Cap at 4 quizzes
  );

  // Generate labels for the chart (up to 4 quizzes)
  const labels = Array.from({ length: maxQuizzes }, (_, i) => `Quiz ${i + 1}`);

  // Create the chart
  progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${value.toFixed(0)}%`;
            },
          },
        },
        legend: { display: true },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return `${value}%`;
            },
          },
        },
      },
    },
  });
}}

  // Recommendations Section
  const recommendationList = document.getElementById("recommendation-list");
  if (recommendationList) {
    recommendationList.innerHTML = ""; // Clear existing content
    
    let hasRecommendations = false;
    
    user.classes.forEach(cls => {
      // Skip if missing performance data
      if (!cls.performance || !cls.performance.quizzes || !cls.performance.assignments) {
        return;
      }
      
      const totalScores = [
        ...cls.performance.quizzes,
        ...cls.performance.assignments
      ];
      
      const averageScore = totalScores.length > 0
        ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length
        : 0;
      
      if (averageScore < 70) {
        hasRecommendations = true;
        recommendationList.innerHTML += `
          <div class="p-4 rounded-lg shadow-md bg-white dark:bg-slate-800">
            <h3 class="font-bold text-gray-900 dark:text-white">${cls.className} Recommendations</h3>
            <ul class="list-disc ml-6 space-y-2">
              <li><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(cls.className)}" target="_blank" class="text-blue-600 hover:underline">Watch YouTube Tutorials</a></li>
              <li><a href="https://www.google.com/search?q=${encodeURIComponent(cls.className + ' practice problems')}" target="_blank" class="text-blue-600 hover:underline">Practice Problems</a></li>
              <li><a href="https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(cls.className)}" target="_blank" class="text-blue-600 hover:underline">Khan Academy Lessons</a></li>
            </ul>
          </div>
        `;
      }
    });
    
    // If no recommendations, show a message
    if (!hasRecommendations) {
      recommendationList.innerHTML = `
        <div class="p-4 rounded-lg shadow-md bg-white dark:bg-slate-800">
          <p class="text-gray-900 dark:text-white">You're doing great! Keep up the good work.</p>
        </div>
      `;
    }
  }
}

// Helper function to generate random colors for charts
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to load quizzes dynamically
function loadQuiz(subject) {
  console.log("Loading quiz for subject:", subject);

  const quizSection = document.getElementById("quiz-section");
  const quizForm = document.getElementById("quiz-form");
  
  if (!quizSection || !quizForm) {
    console.error("Quiz section or form elements not found");
    return;
  }
  
  quizSection.setAttribute("data-subject", subject); // Store the current subject
  quizForm.innerHTML = ""; // Clear previous content

  // Check if quizzes is available
  if (!quizzes || !quizzes[subject]) {
    console.error("No quiz data found for subject:", subject);
    alert(`No quiz available for ${subject}. Please try again later.`);
    return;
  }

  // Dynamically generate quiz questions
  quizzes[subject].forEach((question, index) => {
    // Create a container for the question
    const questionDiv = document.createElement("div");
    questionDiv.className = "mb-6 p-4 bg-gray-50 dark:bg-slate-600 rounded";

    // Add the question text
    const questionText = document.createElement("p");
    questionText.className = "font-bold mb-3";
    questionText.textContent = `${index + 1}. ${question.question}`;
    questionDiv.appendChild(questionText);

    // Add the options as radio buttons
    question.options.forEach(option => {
      const label = document.createElement("label");
      label.className = "block mb-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-500 rounded cursor-pointer";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${index}`; // Unique name for each question
      radio.value = option;
      radio.required = true;
      radio.className = "mr-2";

      label.appendChild(radio);
      label.appendChild(document.createTextNode(` ${option}`));
      questionDiv.appendChild(label);
    });

    // Append the question to the quiz form
    quizForm.appendChild(questionDiv);
  });

  // Add submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "w-full bg-green-600 text-white py-2 rounded hover:bg-green-700";
  submitButton.textContent = "Submit Quiz";
  quizForm.appendChild(submitButton);

  // Show the quiz section
  quizSection.classList.remove("hidden");

  // Hide the results section if it's visible
  const resultsSection = document.getElementById("results-section");
  if (resultsSection) {
    resultsSection.classList.add("hidden");
  }

  // Automatically scroll to the quiz section
  quizSection.scrollIntoView({ behavior: "smooth" });
}

// Handle quiz submission
document.getElementById("quiz-form")?.addEventListener("submit", function(e) {
  e.preventDefault();

  // Get the logged-in user
  let loggedInUser;
  try {
    loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
  
  if (!loggedInUser) {
    alert("You must log in first.");
    window.location.href = "login-register.html";
    return;
  }

  const resultsContainer = document.getElementById("results-container");
  if (!resultsContainer) {
    console.error("Results container not found");
    return;
  }
  
  resultsContainer.innerHTML = ""; // Clear previous results

  // Get the current subject
  const quizSection = document.getElementById("quiz-section");
  const currentSubject = quizSection?.getAttribute("data-subject");

  if (!currentSubject || !quizzes || !quizzes[currentSubject]) {
    console.error("No subject selected or invalid subject.");
    alert("An error occurred while loading the quiz results.");
    return;
  }

  let score = 0;
  const totalQuestions = quizzes[currentSubject].length;

  // Process each question
  quizzes[currentSubject].forEach((question, index) => {
    const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
    const isCorrect = selectedOption && selectedOption.value === question.correctAnswer;
    
    if (isCorrect) {
      score++;
    }

    // Determine feedback color
    const feedbackColor = isCorrect ? "bg-green-200 dark:bg-green-900" : "bg-red-200 dark:bg-red-900";

    // Display each question and result with explanation
    resultsContainer.innerHTML += `
      <div class="p-4 rounded-lg ${feedbackColor} mb-4">
        <p class="font-bold">${question.question}</p>
        <p>Your answer: ${selectedOption ? selectedOption.value : "Not answered"}</p>
        <p>Correct answer: ${question.correctAnswer}</p>
        <p class="italic text-sm mt-2">${question.explanation}</p>
      </div>
    `;
  });

  // Calculate percentage score
  const percentageScore = (score / totalQuestions) * 100;

  // Display final score as a percentage
  resultsContainer.innerHTML += `
    <div class="p-4 bg-blue-200 dark:bg-blue-900 rounded-lg text-center">
      <h3 class="font-bold text-lg">Final Score: ${percentageScore.toFixed(2)}%</h3>
      <p class="mt-2">${score} out of ${totalQuestions} questions correct</p>
    </div>
  `;

  // Show results section
  const resultsSection = document.getElementById("results-section");
  if (resultsSection) {
    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  // Update user's performance data
  const cls = loggedInUser.classes.find(c => c.className === currentSubject);
  if (cls) {
    // Initialize performance object if it doesn't exist
    if (!cls.performance) {
      cls.performance = { quizzes: [], assignments: [] };
    }
    
    // Initialize quizzes array if it doesn't exist
    if (!cls.performance.quizzes) {
      cls.performance.quizzes = [];
    }
    
    cls.performance.quizzes.push(percentageScore);
    sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    console.log("Updated user performance:", loggedInUser);

    // Reload the dashboard to update the graph with the latest quiz score
    loadDashboard(loggedInUser);
  } else {
    console.error(`Class not found for subject: ${currentSubject}`);
  }
});

// Logout functionality
function logout() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login-register.html";
}

// Initialize the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initApp);

// Make functions available globally
window.loadQuiz = loadQuiz;
window.logout = logout;