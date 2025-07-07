document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const courseTitleEl = document.getElementById('course-title');
    const courseDescriptionEl = document.getElementById('course-description');
    const theoryListEl = document.getElementById('theory-module-list');
    const practiceListEl = document.getElementById('practice-module-list');
    const moduleTitleEl = document.getElementById('module-title');
    const moduleDisplayAreaEl = document.getElementById('module-display-area');
    const lexiconBtn = document.getElementById('lexicon-btn');
    
    // Referências à janela (modal) da prova
    const quizModal = document.getElementById('quiz-modal');
    const openQuizBtn = document.getElementById('custom-quiz-btn');
    const closeQuizBtn = document.querySelector('.close-button');
    const quizSetupForm = document.getElementById('quiz-setup-form');
    const quizModuleOptionsEl = document.getElementById('quiz-module-options');
    const quizErrorMsgEl = document.getElementById('quiz-error-message');

    let allModulesData = []; // Armazenará os dados de todos os 17 módulos

    // Função para buscar TODOS os módulos de uma vez, na ordem correta
    async function fetchAllModules() {
        try {
            // A NOVA ORDEM DE ARQUIVOS: 5 de introdução + 12 do curso principal
            const moduleFilenames = [
                'modulo_intro_01.json',
                'modulo_intro_02.json',
                'modulo_intro_03.json',
                'modulo_intro_04.json',
                'modulo_intro_05.json',
                'modulo_01.json',
                'modulo_02.json',
                'modulo_03.json',
                'modulo_04.json',
                'modulo_05.json',
                'modulo_06.json',
                'modulo_07.json',
                'modulo_08.json',
                'modulo_09.json',
                'modulo_10.json',
                'modulo_11.json',
                'modulo_12.json'
            ];

            const fetchPromises = moduleFilenames.map(filename =>
                fetch(`./data/${filename}`).then(res => res.ok ? res.json() : Promise.reject(`Falha ao carregar ${filename}`))
            );
            allModulesData = await Promise.all(fetchPromises);
            return true;
        } catch (error) {
            console.error("Erro fatal ao carregar dados dos módulos:", error);
            moduleTitleEl.textContent = "Erro ao carregar dados do curso. Verifique o console (F12).";
            return false;
        }
    }

    // Função para popular o framework do curso (não precisa de alterações)
    function populateCourseFramework() {
        const firstModuleData = allModulesData[0]; // Pega o título do primeiro módulo da lista
        // Nota: O título do curso será o do primeiro módulo carregado.
        // Se desejar um título fixo, você pode definir aqui: courseTitleEl.textContent = "Seu Título Fixo";
        courseTitleEl.textContent = firstModuleData.courseTitle;
        courseDescriptionEl.textContent = firstModuleData.courseDescription;

        theoryListEl.innerHTML = '';
        practiceListEl.innerHTML = '';
        quizModuleOptionsEl.innerHTML = '';

        allModulesData.forEach((moduleContainer, index) => {
            const module = moduleContainer.modules[0];
            const conceptualModuleId = index + 1; // Usa o índice para manter a ordem 1-17
            const buttonText = `${module.moduleId}: ${module.moduleTitle}`;

            const createButton = (list, type) => {
                const li = document.createElement('li');
                const btn = document.createElement('button');
                btn.textContent = buttonText;
                btn.dataset.moduleId = conceptualModuleId;
                btn.addEventListener('click', () => displayModuleContent(conceptualModuleId, type));
                li.appendChild(btn);
                list.appendChild(li);
            };

            createButton(theoryListEl, 'theory');
            createButton(practiceListEl, 'practice');
            
            const quizLabel = document.createElement('label');
            const quizCheckbox = document.createElement('input');
            quizCheckbox.type = 'checkbox';
            quizCheckbox.value = conceptualModuleId;
            quizLabel.appendChild(quizCheckbox);
            quizLabel.append(` ${buttonText}`);
            quizModuleOptionsEl.appendChild(quizLabel);
        });
    }

    // O resto do arquivo permanece o mesmo
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
        updateActiveButton(moduleId);

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

    function updateActiveButton(conceptualModuleId, specialBtnId = null) {
        document.querySelectorAll('#nav-left button, #nav-right button').forEach(b => b.classList.remove('active'));
        if (specialBtnId) {
            document.getElementById(specialBtnId).classList.add('active');
        } else if (conceptualModuleId) {
            document.querySelectorAll(`button[data-module-id="${conceptualModuleId}"]`).forEach(b => b.classList.add('active'));
        }
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
                updateActiveButton(null, 'lexicon-btn');
            });
            displayModuleContent(1, 'theory'); // Carrega o primeiro módulo da lista (Intro 01)
        }
    }
    init();
});
