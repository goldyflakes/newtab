const shinyChance = 0.05;
const searchEngine = "https://www.google.com/search?client=firefox-b-1-d&q=";

var pokeSprite = "";
var pokeName = "";
var pokeDex = "";
var pokeNum = 0;
var shiny = false;
var caught = false;
var max = 0;


// ----------------------
// pokemon shit
// ----------------------


fetch("https://pokeapi.co/api/v2/pokemon-species/")
    .then((res) => res.json())
    .then((json) => random_pokemon(json))
    
    
function random_pokemon(json) {
    
    
    max = json.count;
    const min = 0;
    
    //get random pokemon from list
    pokeNum = Math.floor(Math.random() * (max - min + 1) + min);
    
    //get pokemon entry from api
    fetch("https://pokeapi.co/api/v2/pokemon/" + pokeNum)
        .then((res) => res.json())
        .then((json => get_pokemon(json)))
}

function get_pokemon(json) {
    // console.log(json);
    
    //get name
    pokeName = json.name;
    
    //get sprite & shiny check
    pokeSprite = json.sprites.front_default;
    
    if(Math.random() < shinyChance) {
        pokeSprite = json.sprites.front_shiny;
        shiny = true;
    }
    
    fetch("https://pokeapi.co/api/v2/pokemon-species/" + pokeNum)
    .then((res) => res.json())
    .then((json => get_pokedex(json)))
}

function get_pokedex(json) {
    //get flavor text
    var entry = json.flavor_text_entries;
    
    //go backwards through games and languages until finding an english entry
    for (var i = entry.length-1; i >= 0; i--) {
        if (entry[i].language.name == "en") {
            pokeDex = entry[i].flavor_text;
            break;
        }
    }
    //TODO maybe skip legends arceus pokedex entrys maybe ??? maybe ????
    set_pokemon();
}

function set_pokemon() {
    const pokeEleImg = document.getElementById("pokemon-sprite");
    const pokeEleName = document.getElementById("pokemon-name");
    const pokeEleDex = document.getElementById("pokemon-dex");
    const pokeEleNum = document.getElementById("pokemon-num");
    const pokeEleStar = document.getElementById("pokemon-star");
    const pokeEleCaught = document.getElementById("pokemon-caught");
    const pokeElePercent = document.getElementById("pokemon-percent");
    
    // console.log(pokeNum);
    // console.log(pokeName);
    // console.log(pokeSprite);
    // console.log(pokeDex);
    
    pokeEleImg.src = pokeSprite;
    pokeEleImg.style.background = "";
    pokeEleName.innerHTML = pokeName;
    pokeEleDex.innerHTML = pokeDex;
    pokeEleNum.innerHTML = pokeNum;
    shiny ? pokeEleStar.style.display = "block" : pokeEleStar.style.display = "none";
    
    if(window.localStorage.getItem(pokeNum.toString()) == null) {
        //pokemon hasn't been seen before, catch it!
        window.localStorage.setItem(pokeNum.toString(), "true");
    }
    else {
        //pokemon has been seen before, show "caught" icon
        pokeEleCaught.style.display = "block";
    }
    
    // -1 because of bookmarks entry
    pokeElePercent.innerHTML = Math.round((((window.localStorage.length - 1) / max) * 100) * 10) / 10 + "%";
    
}


// ----------------------
// other shit
// ----------------------

window.onload = function() {
    setWelcomeMessage();
    createBookmarks();
    initSearch();
}

function setWelcomeMessage() {
    const welcome = document.getElementById("welcome");
    var date =  new Date();
    var hours = date.getHours();
    var timeOfDay = hours <= 6 ? "night" : hours < 12 ? "morning" : hours <= 16 ? "afternoon" : hours <= 22 ? "evening" : "night";  
    welcome.innerHTML = "good " + timeOfDay;
}


// ----------------------
// bookmarks
// ----------------------


function createBookmarks() {    
    const container = document.getElementById("bookmarks");
    while (container.firstChild) {
        //if there are already buttons, remove them
        container.removeChild(container.firstChild);
    }
    
    //get saved bookmarks from local storage
    var bookmarks = window.localStorage.getItem("bookmarks");
    if(bookmarks == null) bookmarks = []
    else bookmarks = JSON.parse(bookmarks);
    
    //fill buttons with bookmark info
    var usedButtons = 0;
    for(var i = 0; i < bookmarks.length; i++) {
        generateButton(bookmarks[i].url, bookmarks[i].name);
        usedButtons++;
        
        if(usedButtons >= 6) return;
    }
    
    //if there's less than 6 buttons, show a "add new bookmark" button
    const addButton = document.createElement("div")
    addButton.onclick = function() { togglePopup() }
    addButton.id = "add-shortcut";
    addButton.className = "shortcut";
    addButton.innerHTML = "+";
    container.appendChild(addButton);
}

function generateButton(url, name) {
    const container = document.getElementById("bookmarks");
    const button = document.createElement("div");
    container.appendChild(button);
    
    //outer button stuff
    button.onclick = function() { openBookmark(url); }
    button.className = "shortcut";
    button.style.display = "flex";
    
    //icon
    const icon = document.createElement("img");
    icon.src = "https://icons.duckduckgo.com/ip3/" + url + ".ico";
    
    //footer
    const footer = document.createElement("div");
    footer.className = "shortcut-footer";
    
    //label
    const label = document.createElement("div");
    label.className = "shortcut-label";
    label.innerHTML = name;
    
    //delete button
    const delButton = document.createElement("div");
    delButton.className = "shortcut-delete";
    delButton.innerHTML = "X";
    delButton.onclick = function(e) { e.stopPropagation(); removeBookmark(button) }
    
    //add stuff to button
    button.appendChild(icon);
    button.appendChild(footer);
    
    footer.appendChild(label);
    footer.appendChild(delButton);
}

function removeBookmark(bookmark) {
    //get bookmarks from local storage
    var bookmarks = window.localStorage.getItem("bookmarks");
    if(bookmarks == null) return; 
    bookmarks = JSON.parse(bookmarks);
    
    var index = Array.from(bookmark.parentElement.children).indexOf(bookmark);
    bookmarks.splice(index, 1);
    
    //add bookmarks back to local storage
    window.localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    
    //regenerate buttons
    createBookmarks();
}

function addBookmark(event) {
    //if nothing was submitted, hide the popup
    if(event.bname.value == "" || event.burl.value == "") {
        togglePopup();
        return false;
    }
    
    //get bookmarks from local storage
    var bookmarks = window.localStorage.getItem("bookmarks");
    if(bookmarks == null) bookmarks = []
    
    else bookmarks = JSON.parse(bookmarks);
    
    //add bookmark to local storage
    bookmarks.push({name: event.bname.value, url: event.burl.value});
    window.localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    
    //hide popup and update bookmark buttons
    togglePopup();
    createBookmarks();
    return false;
}

function togglePopup() {
    const popup = document.getElementById("popup-container");
    
    if(popup.style.display == "flex") {
        popup.style.display = "none";
        return;
    }
    
    popup.style.display = "flex"
}

function openBookmark(url) {
    if(!url.includes("www.")) url = "www." + url;
    if(!url.includes("https://")) url = "https://" + url;
    window.open(url, "_self");
}


// ----------------------
// search
// ----------------------


function initSearch() {
    initProxy();
    const search = document.getElementById("searchbar");
    search.addEventListener("input", searchAutocomplete);
    search.addEventListener("keydown", navigateAutocomplete, false);
}

function initProxy() {
//     // Listen on a specific host via the HOST environment variable
//     var host = process.env.HOST || '0.0.0.0';
//     // Listen on a specific port via the PORT environment variable
//     var port = process.env.PORT || 8080;

//     var cors_proxy = require('cors-anywhere');
//     cors_proxy.createServer({
//         originWhitelist: [], // Allow all origins
//         requireHeader: ['origin', 'x-requested-with'],
//         removeHeaders: ['cookie', 'cookie2']
//     }).listen(port, host, function() {
//         console.log('Running CORS Anywhere on ' + host + ':' + port);
//     });
}

var results = []
var resultIndex = 0;
var inQuickSearch = false;

function searchAutocomplete(e) {
    const auto = document.getElementById("autocomplete");
    
    //check for empty search
    if(e.target.value == "") auto.value = "";
    
    //dont autosuggest if in quicksearch
    checkQuickSearch(e.target.value, false)
    if(inQuickSearch == true) {
        //console.log("quick link found - no suggestions")
        auto.value = "";
        results = [];
        resultIndex = 0;
        return;
    }
    
    //check for spaces
    var query = e.target.value.replace(" ", "+");
    
    //const proxyURL = "http://localhost:8080/";
    const proxyURL = "";
    
    const suggestURL = "https://sugg.search.yahoo.net/sg/?output=json&nresults=10&command=";
    
    //get autosuggestions
    fetch(proxyURL + suggestURL + query, { mode: 'cors' })
        .then((res) => res.json())
        .then((json) => {
            results = json.gossip.results;
            auto.value = results[0].key.toLowerCase();
            resultIndex = 0;
            // console.log(json);
        })
        .catch((error) => {
            auto.value = "";
            results = [];
            resultIndex = 0;
        })
}

function navigateAutocomplete(e) {
    const auto = document.getElementById("autocomplete");
    const search = document.getElementById("searchbar");
    
    if (search.value == "") return;
    // console.log(e.key);
    
    if(e.key == "ArrowUp" && inQuickSearch == false && results.length > 0) {
        e.preventDefault();
        resultIndex -= 1;
        if(resultIndex < 0) resultIndex = 9;
        auto.value = results[resultIndex].key.toLowerCase();
        return false;
    }
    else if(e.key == "ArrowDown" && inQuickSearch == false && results.length > 0) {
        e.preventDefault();
        resultIndex += 1;
        if(resultIndex > 9) resultIndex = 0;
        auto.value = results[resultIndex].key.toLowerCase();
        return false;
    }
    else if(e.key == "Tab" && inQuickSearch == false && results.length > 0) {
        e.preventDefault();
        console.log("tabbed")
        search.value = auto.value;
        return false;
    }
    else if(e.key == "Enter") {
        e.preventDefault();
        
        //check if we're in a quick search
        if(inQuickSearch) checkQuickSearch(search.value, true);
        
        //if we aren't, just search like normal
        else {
            //check for spaces
            var query = search.value.replace(" ", "+");
            window.open(searchEngine + query, "_self");
        }
        return false;
    }
}

function checkQuickSearch(query, open) {
    const prefixSubreddit = "https://www.reddit.com/";
    
    if(query.startsWith("r/")) { //subreddit
        if(open) window.open(prefixSubreddit + query, "_self");
        inQuickSearch = true;
    }
    else {
        inQuickSearch = false;
    }
}

