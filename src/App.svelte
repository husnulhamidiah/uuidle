<script>
  import { onMount } from 'svelte';
  import { generateUUID, evaluateGuess } from './game.js';

  let target = '';
  let history = [];
  let finished = false;

  let input = '';

  const GROUPS = [8, 4, 4, 4, 12];
  const TOTAL = 32;

  onMount(() => {
    target = generateUUID().toUpperCase().replace(/-/g, '');
    // console.debug('Target UUID:', target);
  });

  function normalize(value) {
    return value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, TOTAL);
  }

  function handleInput(e) {
    input = normalize(e.target.value);
  }

  function handleKey(e) {
    if (e.key === 'Enter') submitGuess();
  }

  function submitGuess() {
    if (finished || input.length !== TOTAL) return;

    const result = evaluateGuess(input, target);
    history = [...history, result].slice(-6);

    if (input === target) finished = true;

    input = '';
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
</script>

<style>
  .wrapper {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-family: monospace;
    background: white;
  }

  .board {
    margin-bottom: 24px;
  }

  .row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .group {
    display: flex;
  }

  .dash {
    margin: 0 8px;
    color: #aaa;
    font-size: 22px;
  }

  .cell {
    width: 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 22px;
    background: #eee;
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

  .input-wrapper {
    position: relative;
  }

  .real-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .fake-input {
    display: flex;
    align-items: center;
    cursor: text;
  }

  .fake-cell {
    width: 40px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    background: #eee;
    color: black;
  }

  .fake-cell.active {
    background: #ddd;
  }
</style>

<div class="wrapper">
  <h1>Guess the UUID</h1>
  <div style="display: flex; flex-direction: row; gap: 24px; font-size: 18px; margin-bottom: 24px;">
    {#if finished}
      <h1>🎉 Correct! UUID guessed.</h1>
    {:else}
      <p><span style="color:#22c55e">█</span> correct type, correct letter</p>
      <p><span style="color:#f59e0b">█</span> correct type, wrong letter</p>
      <p><span style="color:#9ca3af">█</span> wrong type, wrong letter</p>
    {/if}
  </div>

  <div class="board">
    {#each history as row}
      <div class="row">
        {#each splitGroups(row) as group, gi}
          <div class="group">
            {#each group as cell}
              <div class="cell {cell.status}">
                {cell.char}
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

  <div class="input-wrapper" on:click={() => document.getElementById('real').focus()}>
    <input
      id="real"
      class="real-input"
      bind:value={input}
      on:input={handleInput}
      on:keydown={handleKey}
      disabled={finished}
    />

    <div class="fake-input">
      {#each GROUPS as size, gi}
        <div class="group">
          {#each Array(size) as _, ci}
            {@const index = GROUPS.slice(0, gi).reduce((a,b)=>a+b,0) + ci}

            <div class="fake-cell {index === input.length ? 'active' : ''}">
              {input[index] || ''}
            </div>
          {/each}
        </div>

        {#if gi < 4}
          <div class="dash">-</div>
        {/if}
      {/each}
    </div>
  </div>
</div>