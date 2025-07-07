document.addEventListener('DOMContentLoaded', async () => {
    console.log("Script lexico.js iniciado."); // MENSAGEM 1

    const titleEl = document.getElementById('lexicon-title');
    const contentEl = document.getElementById('lexicon-content');

    // Função para renderizar uma seção do léxico (reutilizável)
    const renderSection = (sectionData, sectionKey) => {
        console.log(`Renderizando a seção: ${sectionData.title}`); // MENSAGEM 4

        let sectionHTML = `<section class="lexicon-main-section">`;
        sectionHTML += `<h2>${sectionData.title}</h2>`;
        if (sectionData.description) {
            sectionHTML += `<p>${sectionData.description}</p>`;
        }
        
        // Barra de Navegação do Alfabeto
        sectionHTML += `<nav class="alphabet-nav">`;
        sectionData.alphabet.forEach(letter => {
            if (sectionData.wordsByLetter[letter] && sectionData.wordsByLetter[letter].length > 0) {
                sectionHTML += `<a href="#lex-${sectionKey}-${letter}">${letter}</a>`;
            }
        });
        sectionHTML += `</nav>`;

        // Seções e Tabelas de Palavras
        for (const letter of sectionData.alphabet) {
            if (sectionData.wordsByLetter[letter] && sectionData.wordsByLetter[letter].length > 0) {
                sectionHTML += `
                    <div class="lexicon-section">
                        <h2 id="lex-${sectionKey}-${letter}">${letter}</h2>
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
        console.log("Tentando buscar o arquivo lexico_completo.json..."); // MENSAGEM 2
        const response = await fetch('./data/lexico_completo.json');
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo do léxico.');
        
        const lexiconData = await response.json();
        
        console.log("Arquivo encontrado e lido com sucesso! Veja o conteúdo abaixo:"); // MENSAGEM 3
        console.log(lexiconData); // Esta linha vai nos mostrar o objeto JSON inteiro.

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
        
        console.log("HTML final gerado. Inserindo na página..."); // MENSAGEM 5
        contentEl.innerHTML = finalContentHTML;
        console.log("Página preenchida com sucesso!"); // MENSAGEM 6


    } catch (error) {
        console.error("ERRO DETECTADO:", error); // MENSAGEM DE ERRO
        titleEl.textContent = "Erro ao Carregar";
        contentEl.innerHTML = `<p style="text-align: center;">Ocorreu um erro. Verifique o console (F12) para detalhes.</p>`;
    }
});
