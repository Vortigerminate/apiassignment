// names.js - Baby Names web page functionality using the updated REST API

/**
 * Initializes the page when loaded:
 * - Fetches the list of unique baby names
 * - Populates the dropdown
 * - Sets up event handlers
 */
function initialize() {
    fetchUniqueNames();
    
    // Set up event handler for name selection
    $('babyselect').observe('change', function() {
        let selectedName = this.value;
        if (selectedName) {
            fetchRankingData(selectedName);
            fetchMeaningData(selectedName);
        } else {
            // Clear graph and meaning if "Select a name..." is chosen
            $('graph').update('');
            $('meaning').update('');
        }
    });
}

/**
 * Fetches all unique baby names from the API
 */
function fetchUniqueNames() {
    new Ajax.Request('https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f', {
        method: 'get',
        onSuccess: function(response) {
            try {
                let allData = JSON.parse(response.responseText);
                let uniqueNames = extractUniqueNames(allData);
                populateNamesDropdown(uniqueNames);
                $('babyselect').enable();
            } catch (e) {
                showError('Failed to parse baby names data: ' + e.message);
            }
        },
        onFailure: function(response) {
            showError('Failed to fetch baby names: ' + response.statusText);
        }
    });
}

/**
 * Extracts unique names from the full dataset
 * @param {Array} data - The full dataset from API
 * @returns {Array} - Array of unique names
 */
function extractUniqueNames(data) {
    let nameSet = new Set();
    data.forEach(item => nameSet.add(item.name));
    return Array.from(nameSet).sort();
}

/**
 * Populates the names dropdown with unique names
 * @param {Array} names - Array of unique names
 */
function populateNamesDropdown(names) {
    let select = $('babyselect');
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add each name as an option
    names.forEach(function(name) {
        select.appendChild(new Option(name, name));
    });
}

/**
 * Fetches ranking data for a specific name using the filtered API endpoint
 * @param {string} name - The name to fetch ranking data for
 */
function fetchRankingData(name) {
    new Ajax.Request(`https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f/name/${encodeURIComponent(name)}`, {
        method: 'get',
        onSuccess: function(response) {
            try {
                let rankingData = JSON.parse(response.responseText);
                generateRankingGraph(rankingData, name);
            } catch (e) {
                showError('Failed to parse ranking data: ' + e.message);
            }
        },
        onFailure: function(response) {
            showError('Failed to fetch ranking data for ' + name + ': ' + response.statusText);
        }
    });
}

/**
 * Generates the ranking graph from the filtered data
 * @param {Array} data - The filtered ranking data
 * @param {string} name - The name being displayed
 */
function generateRankingGraph(data, name) {
    let graph = $('graph');
    graph.update(''); // Clear previous graph
    
    // Calculate positions and create bars
    let xPos = 10;
    
    // Sort data by year
    data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    
    data.forEach(function(item) {
        let year = item.year;
        let rank = parseInt(item.rank);
        
        // Create year label
        let yearLabel = new Element('p', {
            'class': 'year',
            'style': 'left: ' + xPos + 'px;'
        });
        yearLabel.update(year);
        graph.appendChild(yearLabel);
        
        // Create ranking bar if rank is valid
        if (rank > 0) {
            let height = Math.floor((1000 - rank) / 4);
            let rankingBar = new Element('div', {
                'class': 'ranking',
                'style': 'left: ' + xPos + 'px; height: ' + height + 'px;'
            });
            
            // Style top 10 rankings in red
            if (rank <= 10) {
                rankingBar.addClassName('top-ranking');
            }
            
            rankingBar.update(rank);
            graph.appendChild(rankingBar);
        }
        
        xPos += 60; // 50px width + 10px spacing
    });
}

/**
 * Fetches meaning data for a specific name using the filtered API endpoint
 * @param {string} name - The name to fetch meaning data for
 */
function fetchMeaningData(name) {
    new Ajax.Request(`https://api.sheetbest.com/sheets/c1e0ead6-6df0-49f7-ace0-ec90562a8c3f/name/${encodeURIComponent(name)}`, {
        method: 'get',
        onSuccess: function(response) {
            try {
                let data = JSON.parse(response.responseText);
                displayMeaning(data);
            } catch (e) {
                showError('Failed to parse meaning data: ' + e.message);
            }
        },
        onFailure: function(response) {
            showError('Failed to fetch meaning for ' + name + ': ' + response.statusText);
        }
    });
}

/**
 * Displays the meaning from the filtered data
 * @param {Array} data - The filtered data containing meaning
 */
function displayMeaning(data) {
    // Find the first entry with a meaning
    let nameEntry = data.find(item => item.meaning && item.meaning.trim() !== '');
    
    if (nameEntry) {
        $('meaning').update(nameEntry.meaning);
    } else {
        $('meaning').update('');
    }
}

/**
 * Displays an error message in the errors div
 * @param {string} message - The error message to display
 */
function showError(message) {
    $('errors').update(message);
}

// Initialize the page when loaded
document.observe('dom:loaded', initialize);
