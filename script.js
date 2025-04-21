document.addEventListener("DOMContentLoaded", function() {
  let speciesNames = [];

  // Fetch the species-table.html to render the table
  fetch('species-table.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('table-container').innerHTML = html;
      initializeScripts(); // Initialize the scripts once the table is loaded
    });

  // Function to initialize scripts
  function initializeScripts() {
    const table = document.getElementById("species-records");
    const addRowBtn = document.querySelector(".add-row");
    let autocompleteInputValue = "";

    // Add row functionality
    if (addRowBtn) {
      addRowBtn.addEventListener("click", function() {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="text" placeholder="Enter username"></td>
            <td>
                <div class="autocomplete">
                    <input type="text" id="speciesInput" placeholder="Species you think it is">
                </div>
            </td>
            <td><input type="text" class="date" placeholder="Enter manually">
                <button class="button date-btn" onclick="getDate(this)">USE DEVICE DATE</button>
            </td>
            <td><input type="text" class="place" placeholder="Enter manually">
                <button class="button location-btn" onclick="getLocation(this)">USE DEVICE LOCATION</button>
            </td>
            <td><button class="button submit-btn">SUBMIT</button></td>
        `;
        table.appendChild(newRow);
        
        // Autocomplete functionality
        const speciesInput = newRow.querySelector("#speciesInput");
        if (speciesInput && speciesNames.length > 0) {
          autocomplete(speciesInput, speciesNames);
        }
      });
    }

    // Date and location handling
    window.getDate = function(button) {
      button.previousElementSibling.value = new Date().toISOString().split("T")[0];
    };

    window.getLocation = function(button) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
           button.previousElementSibling.value = `Lat: ${parseFloat(position.coords.latitude.toFixed(2))}, Lon: ${parseFloat(position.coords.longitude.toFixed(2))}`;
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    };

    // Autocomplete function
    function autocomplete(inp, arr) {
      let currentFocus;
      inp.addEventListener("input", function(e) {
        let a, b, i, val = this.value;
        autocompleteInputValue = val;
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        a = document.createElement("div");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("div");
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              autocompleteInputValue = this.getElementsByTagName("input")[0].value;
              closeAllLists();
            });
            a.appendChild(b);
          }
        }
      });

      inp.addEventListener("keydown", function(e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) {
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
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
          if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
          }
        }
      }

      document.addEventListener("click", function (e) {
        closeAllLists(e.target);
      });
    }

    // Fetch species data
    fetch('species-list.json')  // A placeholder for fetching species names
      .then(response => response.json())
      .then(data => {
        speciesNames = data.speciesNames;
      })
      .catch(error => console.error('Error fetching species data:', error));
  }
});
