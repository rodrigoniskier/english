document.addEventListener('DOMContentLoaded', async () => {
    const titleEl = document.getElementById('lexicon-title');
    const navEl = document.getElementById('alphabet-nav');
    const contentEl = document.getElementById('lexicon-content');

    try {
        const response = await fetch('./data/lexico_completo.json');
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo do léxico.');
        
        const lexiconData = await response.json();
        
        titleEl.textContent = lexiconData.lexiconTitle;

        // Cria a barra de navegação do alfabeto
        lexiconData.alphabet.forEach(letter => {
            if (lexiconData.wordsByLetter[letter] && lexiconData.wordsByLetter[letter].length > 0) {
                const letterLink = document.createElement('a');
                letterLink.href = `#lex-${letter}`;
                letterLink.textContent = letter;
                navEl.appendChild(letterLink);
            }
        });

        // Cria as seções e tabelas de palavras
        let allContentHTML = '';
        for (const letter of lexiconData.alphabet) {
            if (lexiconData.wordsByLetter[letter] && lexiconData.wordsByLetter[letter].length > 0) {
                allContentHTML += `
                    <section class="lexicon-section">
                        <h2 id="lex-${letter}">${letter}</h2>
                        <table><tbody>
                            ${lexiconData.wordsByLetter[letter].map(word => `
                                <tr>
                                    <td><strong>${word.english}</strong></td>
                                    <td>${word.portuguese}</td>
                                </tr>
                            `).join('')}
                        </tbody></table>
                    </section>
                `;
            }
        }
        
        contentEl.innerHTML = allContentHTML;

    } catch (error) {
        console.error("ERRO DETECTADO:", error);
        titleEl.textContent = "Erro ao Carregar";
        contentEl.innerHTML = `<p style="text-align: center;">${error.message}</p>`;
    }
});
