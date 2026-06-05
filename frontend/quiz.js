// Resolve the API base URL dynamically based on hosting environment
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000'
  ? 'http://localhost:8000'
  : window.location.origin;

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let hasAnswered = false;
let currentSelectedButton = null;

document.addEventListener("DOMContentLoaded", () => {
    initQuiz();
});

async function initQuiz() {
    try {
        const res = await fetch(`${API_BASE}/learn/`);
        const modules = await res.json();
        if (modules.length > 0 && modules[0].questions && modules[0].questions.length > 0) {
            quizData = modules[0].questions.map(q => ({
                question: q.question_text,
                options: JSON.parse(q.options),
                correctAnswer: q.correct_answer
            }));
            loadQuestion();
        } else {
            document.getElementById("quiz-question").innerText = "Quiz modules are empty. Please run seed_quiz.py!";
            document.getElementById("quiz-progress").innerText = "STATUS ERROR";
        }
    } catch(err) {
        console.error("Failed to load quiz", err);
        document.getElementById("quiz-question").innerText = "Failed to load API Quiz data.";
    }
}

function loadQuestion() {
    const questionData = quizData[currentQuestionIndex];
    document.getElementById("quiz-progress").innerText = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
    document.getElementById("quiz-question").innerText = questionData.question;
    
    const optionsContainer = document.getElementById("quiz-options");
    optionsContainer.innerHTML = "";
    hasAnswered = false;
    currentSelectedButton = null;
    
    const nextBtn = document.getElementById("next-btn");
    nextBtn.style.display = "none";
    nextBtn.innerText = "Submit Answer";
    nextBtn.onclick = submitAnswer;

    questionData.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option";
        btn.innerText = option;
        btn.onclick = () => selectOption(btn);
        optionsContainer.appendChild(btn);
    });
}

function selectOption(buttonClicked) {
    if (hasAnswered) return;

    // Clear previous selection
    const allButtons = document.querySelectorAll(".quiz-option");
    allButtons.forEach(btn => btn.classList.remove("selected"));

    // Select new button
    buttonClicked.classList.add("selected");
    currentSelectedButton = buttonClicked;

    // Show submit button
    document.getElementById("next-btn").style.display = "inline-block";
}

function submitAnswer() {
    if (!currentSelectedButton || hasAnswered) return;
    hasAnswered = true;

    const currentQuestion = quizData[currentQuestionIndex];
    const correctStr = currentQuestion.correctAnswer;
    const allButtons = document.querySelectorAll(".quiz-option");

    if (currentSelectedButton.innerText === correctStr) {
        currentSelectedButton.classList.remove("selected");
        currentSelectedButton.classList.add("correct");
        score++;
    } else {
        currentSelectedButton.classList.remove("selected");
        currentSelectedButton.classList.add("incorrect");
        // highlight correct answer
        allButtons.forEach(btn => {
            if (btn.innerText === correctStr) {
                btn.classList.add("correct");
            }
        });
    }

    // Disable all buttons
    allButtons.forEach(btn => btn.style.cursor = "default");

    // Show next button or results button
    const nextBtn = document.getElementById("next-btn");
    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.innerText = "View Final Score";
    } else {
        nextBtn.innerText = "Next Question →";
    }
    nextBtn.onclick = nextQuestion;
}

function nextQuestion() {
    if (currentQuestionIndex === quizData.length - 1) {
        showResults();
    } else {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function showResults() {
    const quizCard = document.getElementById("quiz-card");
    
    let feedbackMsg = "";
    if (score >= 8) {
        localStorage.setItem('quizPassed', 'true');
        feedbackMsg = `Congrats! You are now ready to read the blog! 🚀<br><span style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 1rem; display: block;">Redirecting automatically in 5 seconds...</span>`;
        setTimeout(() => {
            window.location.href = "blogs.html";
        }, 5000);
    } else {
        localStorage.removeItem('quizPassed');
        feedbackMsg = "Ouch! Looks like a Bear Market on your test scores. You need at least 8/15 to unlock the blogs! Try reviewing our <a href='basic_finance_knowledge.pdf' download target='_blank' style='color: var(--secondary-color); text-decoration: underline;'>Finance Fundamentals Guide</a> and keep studying! 📉";
    }

    quizCard.innerHTML = `
        <i class="fa-solid fa-graduation-cap" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 1.5rem; display: block;"></i>
        <h2 style="font-size: 2.5rem; color: var(--text-primary); margin-bottom: 1rem;">Quiz Completed!</h2>
        <p style="font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 0.5rem;">You scored: <strong style="color: var(--primary-color); font-size: 2rem;">${score}</strong> out of ${quizData.length}</p>
        <p style="font-size: 1.2rem; color: var(--primary-color); margin-bottom: 2.5rem; font-weight: bold; line-height: 1.5;">${feedbackMsg}</p>
        ${score < 8 ? '<button class="btn" onclick="restartQuiz()">Retake Quiz ↻</button>' : '<button class="btn" onclick="window.location.href=\'blogs.html\'">Go to Blogs Now</button>'}
    `;
}

function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    localStorage.removeItem('quizPassed');
    location.reload();
}
