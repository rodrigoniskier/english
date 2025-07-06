document.addEventListener('DOMContentLoaded', async () => {
    const titleEl = document.getElementById('lexicon-title');
    const navEl = document.getElementById('alphabet-nav');
    const contentEl = document.getElementById('lexicon-content');

    try {
        const response = await fetch('./data/lexico_completo.json');
        if (!response.ok) throw new Error('Não foi possível carregar o arquivo do glossário.');
        const lexicon = await response.json();
        
        titleEl.textContent = lexicon.lexiconTitle;

        lexicon.alphabet.forEach(letter => {
            if (lexicon.wordsByLetter[letter] && lexicon.wordsByLetter[letter].length > 0) {
                const letterLink = document.createElement('a');
                letterLink.href = `#lex-${letter}`;
                letterLink.textContent = letter;
                navEl.appendChild(letterLink);
            }
        });

        let allContentHTML = '';
        for (const letter of lexicon.alphabet) {
            if (lexicon.wordsByLetter[letter] && lexicon.wordsByLetter[letter].length > 0) {
                allContentHTML += `
                    <section class="lexicon-section">
                        <h2 id="lex-${letter}">${letter}</h2>
                        <table><tbody>
                            ${lexicon.wordsByLetter[letter].map(word => `
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
        console.error("Erro ao carregar o léxico:", error);
        titleEl.textContent = "Erro ao Carregar";
        contentEl.innerHTML = `<p style="text-align: center;">${error.message}</p>`;
    }
});
