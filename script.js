document.addEventListener('DOMContentLoaded', () => {
    const courseTitleEl = document.getElementById('course-title');
    const courseDescriptionEl = document.getElementById('course-description');
    const theoryListEl = document.getElementById('theory-module-list');
    const practiceListEl = document.getElementById('practice-module-list');
    const moduleTitleEl = document.getElementById('module-title');
    const moduleDisplayAreaEl = document.getElementById('module-display-area');
    const lexiconBtn = document.getElementById('lexicon-btn');
    const quizModal = document.getElementById('quiz-modal');
    const openQuizBtn = document.getElementById('custom-quiz-btn');
    const closeQuizBtn = document.querySelector('.close-button');
    const quizSetupForm = document.getElementById('quiz-setup-form');
    const quizModuleOptionsEl = document.getElementById('quiz-module-options');
    const quizErrorMsgEl = document.getElementById('quiz-error-message');

    const TOTAL_MODULES = 12; // Apenas 12 módulos neste curso
    let allModulesData = [];

    async function fetchAllModules() {
        try {
            const moduleFilenames = Array.from({length: TOTAL_MODULES}, (_, i) => `modulo_${String(i + 1).padStart(2, '0')}.json`);
            const fetchPromises = moduleFilenames.map(filename => fetch(`./data/${filename}`).then(res => res.ok ? res.json() : Promise.reject(`Falha ao carregar ${filename}`)));
            allModulesData = await Promise.all(fetchPromises);
            return true;
        } catch (error) {
            console.error("Erro fatal ao carregar dados dos módulos:", error);
            moduleTitleEl.textContent = "Erro ao carregar dados do curso.";
            return false;
        }
    }

    function populateCourseFramework() {
        const firstModuleData = allModulesData[0];
        courseTitleEl.textContent = firstModuleData.courseTitle;
        courseDescriptionEl.textContent = firstModuleData.courseDescription;
        theoryListEl.innerHTML = '';
        practiceListEl.innerHTML = '';
        quizModuleOptionsEl.innerHTML = '';

        allModulesData.forEach((moduleContainer, index) => {
            const module = moduleContainer.modules[0];
            const moduleId = index + 1;
            const buttonText = `${module.moduleId}: ${module.moduleTitle}`;
            
            const createButton = (list, type) => {
                const li = document.createElement('li');
                const btn = document.createElement('button');
                btn.textContent = buttonText;
                btn.dataset.moduleId = moduleId;
                btn.addEventListener('click', () => displayModuleContent(moduleId, type));
                li.appendChild(btn);
                list.appendChild(li);
            };

            createButton(theoryListEl, 'theory');
            createButton(practiceListEl, 'practice');

            const quizLabel = document.createElement('label');
            const quizCheckbox = document.createElement('input');
            quizCheckbox.type = 'checkbox';
            quizCheckbox.value = moduleId;
            quizLabel.appendChild(quizCheckbox);
            quizLabel.append(` ${buttonText}`);
            quizModuleOptionsEl.appendChild(quizLabel);
        });
    }

    function displayModuleContent(moduleId, contentType) {
        const module = allModulesData[moduleId - 1].modules[0];
        moduleTitleEl.textContent = `${module.moduleId}: ${module.moduleTitle}`;
        let contentHTML = '';

        if (contentType === 'theory') {
            contentHTML = module.content.html;
        } else {
            const flashcardsHTML = `<h3>Flashcards</h3>` + module.flashcards.map(card => `<div class="flashcard"><div class="front">${card.front}</div><div class="back">${card.back}</div></div>`).join('');
            const exercisesHTML = `<h3>Exercícios</h3>` + module.exercises.map((ex, index) => `<div class="exercise"><p class="prompt">${index + 1}. ${ex.question}</p><div class="options">${ex.options.map((opt, i) => `<label><input type="radio" name="ex${index}" value="${i}"> ${opt}</label>`).join('')}</div><button class="check-answer" data-explanation="${ex.explanation}">Ver Resposta</button><div class="explanation"></div></div>`).join('');
            contentHTML = flashcardsHTML + exercisesHTML;
        }

        moduleDisplayAreaEl.innerHTML = contentHTML;
        updateActiveButton(moduleId, contentType);

        if (contentType === 'practice') addExerciseListeners();
    }
    
    function addExerciseListeners() {
        document.querySelectorAll('.check-answer').forEach(button => {
            button.addEventListener('click', e => {
                const explanationDiv = e.target.nextElementSibling;
                explanationDiv.innerHTML = `<b>Explicação:</b> ${e.target.dataset.explanation}`;
                explanationDiv.style.display = explanationDiv.style.display === 'block' ? 'none' : 'block';
            });
        });
    }

    function updateActiveButton(moduleId, type) {
        document.querySelectorAll('#nav-left button, #nav-right button').forEach(b => b.classList.remove('active'));
        const list = type === 'theory' ? theoryListEl : practiceListEl;
        const activeButton = list.querySelector(`button[data-module-id="${moduleId}"]`);
        if (activeButton) activeButton.classList.add('active');
        document.getElementById('lexicon-btn').classList.remove('active');
    }
    
    openQuizBtn.onclick = () => { quizModal.style.display = 'block'; quizErrorMsgEl.textContent = ''; };
    closeQuizBtn.onclick = () => { quizModal.style.display = 'none'; };
    window.onclick = (event) => { if (event.target === quizModal) quizModal.style.display = 'none'; };

    quizSetupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selected = quizModuleOptionsEl.querySelectorAll('input:checked');
        if (selected.length < 1 || selected.length > 5) {
            quizErrorMsgEl.textContent = 'Erro: Selecione de 1 a 5 módulos.'; return;
        }
        quizErrorMsgEl.textContent = '';
        let questions = [];
        selected.forEach(cb => {
            const module = allModulesData[parseInt(cb.value, 10) - 1].modules[0];
            const hardQuestions = module.exercises.filter(ex => ex.difficulty === 'hard');
            questions.push(...hardQuestions);
        });
        if (questions.length === 0) {
            quizErrorMsgEl.textContent = 'Nenhum exercício difícil encontrado nos módulos selecionados.'; return;
        }
        localStorage.setItem('customQuizData', JSON.stringify({ questions }));
        window.open('prova.html', '_blank');
        quizModal.style.display = 'none';
    });

    async function init() {
        if (await fetchAllModules()) {
            populateCourseFramework();
            lexiconBtn.addEventListener('click', () => {
                window.open('lexico.html', '_blank');
                document.querySelectorAll('#nav-left button, #nav-right button').forEach(b => b.classList.remove('active'));
                lexiconBtn.classList.add('active');
            });
            displayModuleContent(1, 'theory');
        }
    }
    init();
});
