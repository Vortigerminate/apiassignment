/*
 * CSCV 337 Assignment 5 - Baby Names
 * names.js
 *
 * Author: [Your Name]
 * This JavaScript file fetches baby name data, rankings, and meanings via Ajax
 * and updates the DOM to match the required functionality.
 */

window.onload = function () {
    fetchNameList();
    $('babyselect').observe('change', onNameSelected);
  };
  
  const API_BASE = "https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f";
  
  function fetchNameList() {
    new Ajax.Request(API_BASE, {
      method: "get",
      onSuccess: function (response) {
        const data = response.responseJSON;
        const names = [...new Set(data.map(entry => entry.name))].sort(); // unique + sort
        const select = $('babyselect');
        names.forEach(name => {
          const option = document.createElement('option');
          option.value = name;
          option.text = name;
          select.appendChild(option);
        });
        select.disabled = false;
      },
      onFailure: showError
    });
  }
  
  function onNameSelected() {
    const name = this.value;
    if (!name) return;
  
    clearGraph();
    clearMeaning();
    clearError();
  
    fetchRankingData(name);
    fetchMeaning(name);
  }
  
  function fetchRankingData(name) {
    new Ajax.Request(`${API_BASE}/name/${name}`, {
      method: "get",
      onSuccess: function (response) {
        const data = response.responseJSON;
        if (!data.length) return;
  
        const years = [...new Set(data.map(entry => entry.year))].sort(); // sorted by year
        const graph = $('graph');
  
        years.forEach((year, i) => {
          const yearData = data.find(entry => entry.year === year);
          const rank = parseInt(yearData.rank);
          const x = 10 + i * 60;
  
          // Label
          const label = document.createElement('p');
          label.className = 'year';
          label.innerText = year;
          label.style.left = `${x}px`;
          graph.appendChild(label);
  
          // Ranking Bar
          const bar = document.createElement('div');
          bar.className = 'ranking';
          const height = rank === 0 ? 0 : Math.floor((1000 - rank) / 4);
          bar.style.height = `${height}px`;
          bar.style.left = `${x}px`;
          bar.style.bottom = '0px';
          bar.innerText = rank === 0 ? '' : rank;
  
          if (rank > 0 && rank <= 10) {
            bar.style.color = 'red';
          }
  
          graph.appendChild(bar);
        });
      },
      onFailure: showError
    });
  }
  
  function fetchMeaning(name) {
    new Ajax.Request(`${API_BASE}/name/${name}`, {
      method: "get",
      onSuccess: function (response) {
        const data = response.responseJSON;
        if (data.length > 0 && data[0].meaning) {
          $('meaning').innerText = data[0].meaning;
        } else {
          $('meaning').innerText = '';
        }
      },
      onFailure: function (response) {
        // Only show error if not a missing meaning (404s are expected for some)
        if (response.status !== 404) showError(response);
      }
    });
  }
  
  // Utility: clear graph section
  function clearGraph() {
    $('graph').innerHTML = '';
  }
  
  // Utility: clear meaning section
  function clearMeaning() {
    $('meaning').innerText = '';
  }
  
  // Utility: display error message in #errors
  function showError(response) {
    const errorDiv = $('errors');
    errorDiv.innerHTML = `<p>Error ${response.status}: ${response.statusText || 'An error occurred while loading data.'}</p>`;
  }
  
  // Utility: clear previous errors
  function clearError() {
    $('errors').innerHTML = '';
  }
  
