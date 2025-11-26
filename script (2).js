/* === script.js: Тест логикасы (Екі режимді қолдау) === */

document.addEventListener('DOMContentLoaded', () => {
    // Негізгі элементтер
    const modeSelectionDiv = document.querySelector('.mode-selection');
    const modeVariantBtn = document.getElementById('mode-variant-btn');
    const modeRandomBtn = document.getElementById('mode-random-btn');
    
    const variantModeControls = document.getElementById('variant-mode-controls');
    const randomModeControls = document.getElementById('random-mode-controls');
    
    const variantSelect = document.getElementById('variant-select');
    const startVariantTestBtn = document.getElementById('start-variant-test-btn');
    const startRandomTestBtn = document.getElementById('start-random-test-btn');
    
    const submitTestBtn = document.getElementById('submit-test-btn');
    const testArea = document.getElementById('test-area');
    const resultsDiv = document.getElementById('results');

    let currentQuestions = [];
    let currentMode = null; // 'variant' немесе 'random'

    // === 1. Варианттарды толтыру ===
    function populateVariants() {
        for (const [id, name] of Object.entries(variantNames)) {
            const option = document.createElement('option');
            option.value = id;
            // Варианттағы сұрақтар санын есептеу
            const count = allQuestions.filter(q => q.variant == id).length;
            option.textContent = `${name.split(' (')[0]} (${count} сұрақ)`;
            variantSelect.appendChild(option);
        }
    }

    // === 2. Кездейсоқ сұрақтарды таңдау функциясы ===
    function getShuffledQuestions(source, count) {
        // Source - массив немесе allQuestions-дан сүзілген массив
        const shuffled = source.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, source.length));
    }

    // === 3. Сұрақтарды көрсету (Рендерлеу) ===
    function renderQuestions(questions) {
        testArea.innerHTML = '';
        resultsDiv.style.display = 'none';
        
        questions.forEach((q, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.className = 'question-block';
            // ID-ні сұрақтарды бірегейлендіру үшін пайдаланамыз
            questionBlock.id = `question-${q.id}`; 
            
            const questionText = document.createElement('p');
            questionText.className = 'question-text';
            questionText.innerHTML = `${index + 1}. ${q.q}`;
            questionBlock.appendChild(questionText);
            
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'options';
            
            // Жауап нұсқаларын араластыру
            const shuffledOptions = q.o.map((text, i) => ({ text, value: String.fromCharCode(65 + i) }));
            shuffledOptions.sort(() => 0.5 - Math.random());
            
shuffledOptions.forEach(option => {
    const label = document.createElement('label');
    label.className = 'option-label';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `q-${q.id}`;
    input.value = option.value;

    // Бірден жауапты тексеру
    input.addEventListener('change', () => {
        // Барлық опцияларды бұғаттау
        optionsDiv.querySelectorAll('input').forEach(inp => inp.disabled = true);

        const correctAnswer = q.a;

        if (option.value === correctAnswer) {
            // Дұрыс жауап
            label.classList.add('correct');
        } else {
            // Қате жауап + дұрыс жауапты бояу
            label.classList.add('wrong');
            optionsDiv.querySelector(`input[value="${correctAnswer}"]`)
                .parentElement.classList.add('correct');
        }
    });

    label.appendChild(input);
    label.innerHTML += ` ${option.value}) ${option.text}`;
    optionsDiv.appendChild(label);
});

            
            questionBlock.appendChild(optionsDiv);
            testArea.appendChild(questionBlock);
        });

        testArea.style.display = 'block';
        submitTestBtn.style.display = 'block';
    }

    // === 4. Режимді таңдау логикасы ===
    modeVariantBtn.addEventListener('click', () => {
        variantModeControls.style.display = 'flex';
        randomModeControls.style.display = 'none';
        modeSelectionDiv.style.display = 'none';
        submitTestBtn.style.display = 'none';
        testArea.style.display = 'none';
        currentMode = 'variant';
    });

    modeRandomBtn.addEventListener('click', () => {
        randomModeControls.style.display = 'flex';
        variantModeControls.style.display = 'none';
        modeSelectionDiv.style.display = 'none';
        submitTestBtn.style.display = 'none';
        testArea.style.display = 'none';
        currentMode = 'random';
    });
    
    // === 5. Тестті бастау (Вариантты таңдау) ===
    startVariantTestBtn.addEventListener('click', () => {
        const variantId = parseInt(variantSelect.value);
        const filteredQuestions = allQuestions.filter(q => q.variant == variantId);
        
        // Режим 1: Барлық сұрақтарды таңдау
        currentQuestions = filteredQuestions;
        
        if (currentQuestions.length === 0) {
            testArea.innerHTML = '<p class="question-text" style="color: red;">Таңдалған вариантта сұрақтар табылмады.</p>';
            testArea.style.display = 'block';
            return;
        }

        renderQuestions(currentQuestions);
    });

    // === 6. Тестті бастау (Кездейсоқ 30 сұрақ) ===
    startRandomTestBtn.addEventListener('click', () => {
        // Режим 2: Барлық 156 сұрақтан 30 кездейсоқ сұрақ таңдау
        currentQuestions = getShuffledQuestions(allQuestions, TOTAL_RANDOM_QUESTIONS);
        
        renderQuestions(currentQuestions);
    });


    // === 7. Нәтижені тексеру ===
    submitTestBtn.addEventListener('click', () => {
        let correctCount = 0;
        const totalCount = currentQuestions.length;

        currentQuestions.forEach((q, index) => {
            const questionBlock = document.getElementById(`question-${q.id}`);
            if (!questionBlock) return; // Сұрақ блогы табылмаса, өткізіп жіберу

            const optionsDiv = questionBlock.querySelector('.options');
            const selectedOption = optionsDiv.querySelector(`input[name="q-${q.id}"]:checked`);
            
            // Тазалау және өшіру
            questionBlock.classList.remove('result-correct', 'result-incorrect');
            optionsDiv.querySelectorAll('label').forEach(label => {
                label.classList.remove('selected', 'correct');
                label.querySelector('input[type="radio"]').disabled = true;
            });

            const correctAnswer = q.a;
            let isCorrect = false;

            if (selectedOption) {
                const selectedValue = selectedOption.value;
                
                if (selectedValue === correctAnswer) {
                    isCorrect = true;
                    correctCount++;
                }

                // Таңдалған опцияны белгілеу
                optionsDiv.querySelector(`input[value="${selectedValue}"]`).parentElement.classList.add('selected');

                questionBlock.classList.add(isCorrect ? 'result-correct' : 'result-incorrect');

                if (!isCorrect) {
                    // Бұрыс жауап болса, дұрысын көрсету
                    optionsDiv.querySelector(`input[value="${correctAnswer}"]`).parentElement.classList.add('correct');
                }
            } else {
                // Жауап берілмесе, дұрыс жауапты көрсету
                questionBlock.classList.add('result-incorrect');
                optionsDiv.querySelector(`input[value="${correctAnswer}"]`).parentElement.classList.add('correct');
            }
        });

        // Жалпы нәтижені көрсету
        const modeTitle = (currentMode === 'variant') 
            ? `Вариант: ${variantNames[currentQuestions[0].variant].split(' (')[0]}`
            : `Режим: Кездейсоқ ${TOTAL_RANDOM_QUESTIONS} сұрақ (Жалпы қор)`;
            
        resultsDiv.innerHTML = `
            <h2>✅ Тест нәтижесі</h2>
            <p><strong>${modeTitle}</strong></p>
            <p><strong>Сұрақтар саны:</strong> ${totalCount}</p>
            <p><strong>Дұрыс жауаптар:</strong> ${correctCount}</p>
            <p><strong>Пайыздық көрсеткіш:</strong> ${((correctCount / totalCount) * 100).toFixed(2)}%</p>
            <hr>
            <p style="font-size: 14px; color: #555;">Жасыл түс - дұрыс жауап. Қызыл түс - сіздің бұрыс жауабыңыз.</p>
        `;
        resultsDiv.style.display = 'block';
        submitTestBtn.style.display = 'none';
        
        // Нәтижелерге жылжу
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    });

    // === Бастапқы іске қосу ===
    populateVariants();
});