let csvData = [];

// Fetch the CSV data and initialize the scripts
fetch('uk_species_list.csv')
  .then(response => response.text())
  .then(data => {
    csvData = parseCSV(data);
    initializeScripts();
  })
  .catch(error => console.error('Error fetching CSV:', error));

// Parse CSV string into an array of objects
function parseCSV(data) {
  const rows = data.split('\n');
  const headers = rows[0].split(',');
  const parsedData = rows.slice(1).map(row => {
    const values = row.split(',');
    let obj = {};
    values.forEach((value, index) => {
      obj[headers[index].trim()] = value.trim();
    });
    return obj;
  });
  return parsedData;
}

// Initialize scripts after CSV is loaded
function initializeScripts() {
  autocomplete(document.getElementById('speciesInput'), csvData);
}

// Autocomplete function for species name
function autocomplete(inp, arr) {
  let currentFocus;

  inp.addEventListener('input', function() {
    let a, b, i, val = this.value;
    closeAllLists();
    if (!val) return false;
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);

    for (i = 0; i < arr.length; i++) {
      if (arr[i].species_name.toLowerCase().includes(val.toLowerCase())) {
        b = document.createElement("DIV");
        b.innerHTML = arr[i].species_name;
        b.addEventListener("click", function() {
          inp.value = this.innerHTML;
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });

  inp.addEventListener("keydown", function(e) {
    let x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode === 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode === 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode === 13) {
      e.preventDefault();
      if (currentFocus > -1 && x) x[currentFocus].click();
    }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    let x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
      if (elmnt !== x[i] && elmnt !== inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}
