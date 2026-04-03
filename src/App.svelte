<script>
  import { onMount } from 'svelte';
  import { generateUUID, evaluateGuess } from './game.js';

  let target = '';
  let history = [];
  let finished = false;

  const TOTAL = 32;
  const GROUPS = [8, 4, 4, 4, 12];

  let chars = Array(TOTAL).fill('');
  let inputs = [];

  onMount(() => {
    target = generateUUID().toUpperCase();
    console.log('Target UUID:', target);
  });

  function getFlatValue() {
    return chars.join('');
  }

  function handleInput(e, i) {
    let val = e.target.value.toUpperCase();

    // strip non-hex + dashes
    val = val.replace(/[^A-F0-9]/g, '');

    if (!val) {
      chars[i] = '';
      return;
    }

    // handle paste / multi-char
    for (let j = 0; j < val.length && i + j < TOTAL; j++) {
      chars[i + j] = val[j];
    }

    moveCursor(i + val.length);
  }

  function handleKey(e, i) {
    if (e.key === 'Backspace') {
      if (chars[i]) {
        chars[i] = '';
      } else if (i > 0) {
        moveCursor(i - 1);
      }
    }

    if (e.key === 'ArrowLeft' && i > 0) {
      moveCursor(i - 1);
    }

    if (e.key === 'ArrowRight' && i < TOTAL - 1) {
      moveCursor(i + 1);
    }

    if (e.key === 'Enter') {
      submitGuess();
    }
  }

  function moveCursor(i) {
    if (i < 0 || i >= TOTAL) return;
    inputs[i]?.focus();
  }

  function submitGuess() {
    if (finished) return;

    const guess = getFlatValue();
    if (guess.length !== TOTAL) return;

    const result = evaluateGuess(guess, target);
    history = [...history, result];

    if (guess === target) {
      finished = true;
    }

    chars = Array(TOTAL).fill('');
    moveCursor(0);
  }

  function splitGroups(row) {
    const chars = row.filter(c => c.char !== '-');

    return [
      chars.slice(0, 8),
      chars.slice(8, 12),
      chars.slice(12, 16),
      chars.slice(16, 20),
      chars.slice(20)
    ];
  }

	function handlePaste(e, startIndex) {
		e.preventDefault();

		let text = e.clipboardData.getData('text').toUpperCase();

		// remove dashes and anything invalid
		text = text.replace(/[^A-F0-9]/g, '');

		for (let i = 0; i < text.length && startIndex + i < TOTAL; i++) {
			chars[startIndex + i] = text[i];
		}

		moveCursor(Math.min(startIndex + text.length, TOTAL - 1));
	}
</script>

<style>
  .wrapper {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-family: monospace;
  }

  .board {
    margin-bottom: 20px;
  }

  .row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .group {
    display: flex;
  }

  .dash {
    margin: 0 6px;
    color: #888;
  }

  .cell {
    width: 24px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    border-radius: 4px;
    margin-right: 2px;
  }

  .correct {
    background: #22c55e;
    color: white;
  }

  .type {
    background: #f59e0b;
    color: white;
  }

  .wrong {
    background: #9ca3af;
    color: white;
  }

  .input-row {
    display: flex;
    align-items: center;
  }

  .char-input {
    width: 24px;
    height: 32px;
    text-align: center;
    font-size: 16px;
    margin-right: 2px;
    text-transform: uppercase;
  }
</style>

<div class="wrapper">
  <div class="board">
    {#each history as row}
      <div class="row">
        {#each splitGroups(row) as group, gi}
          <div class="group">
            {#each group as cell}
              <div class="cell {cell.status}">
                {cell.char.toUpperCase()}
              </div>
            {/each}
          </div>

          {#if gi < 4}
            <div class="dash">-</div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  <div class="input-row">
  {#each GROUPS as size, gi}
    <div class="group">
      {#each Array(size) as _, ci}
        {@const index = GROUPS.slice(0, gi).reduce((a, b) => a + b, 0) + ci}

        <input
					class="char-input"
					maxlength="32"
					bind:this={inputs[index]}
					value={chars[index]}
					on:input={(e) => handleInput(e, index)}
					on:keydown={(e) => handleKey(e, index)}
					on:paste={(e) => handlePaste(e, index)}
					disabled={finished}
				/>
      {/each}
    </div>

    {#if gi < 4}
      <div class="dash">-</div>
		{/if}
	{/each}
	</div>

  {#if finished}
    <p>🎉 Correct! UUID guessed.</p>
  {/if}
</div>