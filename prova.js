document.addEventListener('DOMContentLoaded', () => {
    const quizFormEl = document.getElementById('quiz-form');
    const quizFormContainer = document.getElementById('quiz-form-container');
    const resultsEl = document.getElementById('quiz-results');
    const scoreEl = document.getElementById('quiz-score');
    const answerKeyEl = document.getElementById('quiz-answer-key');

    const quizDataJSON = localStorage.getItem('customQuizData');
    if (!quizDataJSON) {
        quizFormContainer.innerHTML = '<h2>Erro</h2><p>Nenhum dado de prova encontrado. Gere uma nova prova na página principal.</p>';
        return;
    }

    const quizData = JSON.parse(quizDataJSON);
    
    quizFormEl.innerHTML = quizData.questions.map((q, index) => `
        <li>
            <div class="exercise">
                <p class="prompt">${index + 1}. ${q.question}</p>
                <div class="options">
                    ${q.options.map((opt, i) => `
                        <label><input type="radio" name="q${index}" value="${i}" required> ${opt}</label>
                    `).join('')}
                </div>
            </div>
        </li>
    `).join('');

    quizFormContainer.addEventListener('submit', (event) => {
        event.preventDefault();
        let score = 0;
        const answerKeyHTML = quizData.questions.map((q, index) => {
            const formData = new FormData(quizFormContainer);
            const userAnswer = formData.get(`q${index}`);
            const isCorrect = userAnswer == q.correct;
            
            if (isCorrect) score++;

            return `
                <div class="result-question">
                    <p><b>Questão ${index + 1}:</b> ${q.question}</p>
                    <p>Sua resposta: <span class="${isCorrect ? 'correct-answer' : 'wrong-answer'}">${q.options[userAnswer]}</span></p>
                    ${!isCorrect ? `<p>Resposta correta: <span class="correct-answer">${q.options[q.correct]}</span></p>` : ''}
                    <p><small><i>Explicação: ${q.explanation}</i></small></p>
                </div>
            `;
        }).join('');

        scoreEl.textContent = `Sua nota foi: ${score} de ${quizData.questions.length} (${((score / quizData.questions.length) * 100).toFixed(1)}%)`;
        answerKeyEl.innerHTML = answerKeyHTML;
        resultsEl.style.display = 'block';
        quizFormContainer.style.display = 'none';
        localStorage.removeItem('customQuizData');
    });
});
