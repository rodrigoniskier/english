document.addEventListener('DOMContentLoaded', async () => {
    const titleEl = document.getElementById('lexicon-title');
    const contentEl = document.getElementById('lexicon-content');

    // Função para renderizar uma seção completa do léxico (reutilizável)
    const renderSection = (sectionData, keyPrefix) => {
        if (!sectionData || !sectionData.wordsByLetter) {
            return ''; // Retorna string vazia se a seção de dados for inválida
        }

        let sectionHTML = `<section class="lexicon-main-section">`;
        sectionHTML += `<h2>${sectionData.title}</h2>`;
        if (sectionData.description) {
            sectionHTML += `<p>${sectionData.description}</p>`;
        }
        
        // Barra de Navegação do Alfabeto
        sectionHTML += `<nav class="alphabet-nav">`;
        sectionData.alphabet.forEach(letter => {
            if (sectionData.wordsByLetter[letter] && sectionData.wordsByLetter[letter].length > 0) {
                sectionHTML += `<a href="#lex-${keyPrefix}-${letter}">${letter}</a>`;
            }
        });
        sectionHTML += `</nav>`;

        // Seções e Tabelas de Palavras
        for (const letter of sectionData.alphabet) {
            if (sectionData.wordsByLetter[letter] && sectionData.wordsByLetter[letter].length > 0) {
                sectionHTML += `
                    <div class="lexicon-section">
                        <h2 id="lex-${keyPrefix}-${letter}">${letter}</h2>
                        <table><tbody>
                            ${sectionData.wordsByLetter[letter].map(word => `
                                <tr>
                                    <td><strong>${word.english}</strong></td>
                                    <td>${word.portuguese || word.back}</td>
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
            finalContentHTML += renderSection(lexiconData.courseGlossary, 'glossary');
        }

        // Adiciona uma linha de separação visual
        finalContentHTML += "<hr style='margin: 60px 0; border: 1px solid #ccc;'>";

        // Renderiza a segunda seção: Léxico de Frequência
        if (lexiconData.frequencyLexicon) {
            finalContentHTML += renderSection(lexiconData.frequencyLexicon, 'frequency');
        }

        contentEl.innerHTML = finalContentHTML;

    } catch (error) {
        console.error("ERRO DETECTADO:", error);
        titleEl.textContent = "Erro ao Carregar";
        contentEl.innerHTML = `<p style="text-align: center;">Ocorreu um erro ao processar o léxico. Verifique o console (F12) para detalhes. O problema mais provável é uma inconsistência entre o arquivo JSON e o script.</p>`;
    }
});
