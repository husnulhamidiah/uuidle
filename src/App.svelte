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
    target = generateUUID().toUpperCase();
    console.log('Target UUID:', target);
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
    history = [...history, result];

    if (input === target) finished = true;

    input = '';
  }

  function splitGroupsFromString(str) {
    return [
      str.slice(0, 8),
      str.slice(8, 12),
      str.slice(12, 16),
      str.slice(16, 20),
      str.slice(20)
    ];
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

  {#if finished}
    <p>🎉 Correct! UUID guessed.</p>
  {/if}
</div>