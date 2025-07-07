document.addEventListener('DOMContentLoaded', async () => {
    const titleEl = document.getElementById('lexicon-title');
    const contentEl = document.getElementById('lexicon-content');

    // Função para renderizar uma seção do léxico (reutilizável)
    const renderSection = (sectionData) => {
        let sectionHTML = `<section class="lexicon-main-section">`;
        sectionHTML += `<h2>${sectionData.title}</h2>`;
        sectionHTML += `<p>${sectionData.description}</p>`;
        
        // Barra de Navegação do Alfabeto
        sectionHTML += `<nav class="alphabet-nav">`;
        sectionData.alphabet.forEach(letter => {
            if (sectionData.wordsByLetter[letter] && sectionData.wordsByLetter[letter].length > 0) {
                sectionHTML += `<a href="#lex-${sectionData.title.substring(0, 4)}-${letter}">${letter}</a>`;
            }
        });
        sectionHTML += `</nav>`;

        // Seções e Tabelas de Palavras
        for (const letter of sectionData.alphabet) {
            if (sectionData.wordsByLetter[letter] && sectionData.wordsByLetter[letter].length > 0) {
                sectionHTML += `
                    <div class="lexicon-section">
                        <h2 id="lex-${sectionData.title.substring(0, 4)}-${letter}">${letter}</h2>
                        <table><tbody>
                            ${sectionData.wordsByLetter[letter].map(word => `
                                <tr>
                                    <td><strong>${word.english}</strong></td>
                                    <td>${word.portuguese}</td>
                                </tr>
                            `).join('')}
                        </tbody></table>
                    </div>
                `;
            }
        }
        sectionHTML += `</section>`;
        return sectionHTML;
    };

    try {
        const response = await fetch('./data/lexico_completo.json');
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo do léxico.');
        
        const lexiconData = await response.json();
        
        titleEl.textContent = lexiconData.lexiconTitle;

        let finalContentHTML = '';
        // Renderiza a primeira seção: Glossário do Curso
        if (lexiconData.courseGlossary) {
            finalContentHTML += renderSection(lexiconData.courseGlossary);
        }

        // Adiciona uma linha de separação visual
        finalContentHTML += "<hr style='margin: 60px 0; border: 1px solid #ccc;'>";

        // Renderiza a segunda seção: Léxico de Frequência
        if (lexiconData.frequencyLexicon) {
            finalContentHTML += renderSection(lexiconData.frequencyLexicon);
        }

        contentEl.innerHTML = finalContentHTML;

    } catch (error) {
        console.error("Erro ao carregar o léxico:", error);
        titleEl.textContent = "Erro ao Carregar";
        contentEl.innerHTML = `<p style="text-align: center;">${error.message}</p>`;
    }
});
