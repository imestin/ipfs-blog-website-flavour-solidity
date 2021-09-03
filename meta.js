var mainDB = mainDB || null;                                                                    // Create mainDB if does not exist
var gateway = gateway || 'https://ipfs.io/';                                                    // meta.js is now the file that creates the DB
const mainDBurl = gateway + 'ipns/' + 'k2k4r8mqe0akz71ijxrmkvhnmf9da1l5uiuuv854jwundi19kqirh4e4';

// Fetch article meta, returns an object
async function fetchMeta(articleHash) {
    let url = gateway + 'ipfs/' + articleHash + '/meta.json';
    let response = await fetch(url)
                            .catch(error => console.error("Error (fetch): ", error));           // IPFS error will not cause error in fetch
    let obj = await response.json()
                            .catch(() => {throw "Couldn't fetch article " + articleHash});      // IPFS error will cause error in the JSON parsing 
                                                                                                // (response is not a JSON object)
    return obj;
}

async function loadDB() {                                                                       // loads mainDB
    mainDB = await fetch(mainDBurl)                                                             // and also runs refreshHelpLinks()
        .then(response => response.json())
        .catch(error => console.error("Error while fetching the database, ", error));
        refreshHelpLinks();
}

async function refreshHelpLinks() {                                                             // The help links will be updated with the database.json values
    let beginner = document.getElementById("modalRow2");
    let advanced = document.getElementById("modalRow3");
    beginner.href = "article.html?cid=" + mainDB.helpfile_beginner;
    advanced.href = "article.html?cid=" + mainDB.helpfile_advanced;
}