var metaArray = [];


// This will download the `database.json` and will display a list of cards of the articles
async function loadMain() {
    document.getElementById("loading").style ="display: block";                 // Display loading screen
    await loadDB();                                                             // Load the main database
    document.getElementById("loading").style = "display: none";                 // Hide loading screen
    listArticles();                                                             // Load the articles, these will be individual fetch operations
}

async function loadDB() {
    mainDB = await fetch(mainDBurl)
        .then(response => response.json())
        .catch(error => console.error("Error while fetching the database, ", error));
}

async function listArticles() {
    for (let i = 0; i < mainDB.articles.length; i++) {              // Newly loaded articles might appear after first load
        metaArray[i] = await fetchMeta(mainDB.articles[i])                      
          .catch(error => console.error(error));
        appendList(i);
      }
}

async function appendList(index) {
    let listElement = document.createElement("li");                   // Create new list element
    let link = document.createElement("a");                           // Create link (under <li>)
    link.href = 'article.html?cid=' + mainDB.articles[index];
    link.classList = "cardLink";
    let card = document.createElement("div");                         // Create card (under <a>)
    card.classList = "articleCard";
  
    let title = document.createElement("h2");                         // Create subcomponents of DIV
    let img = document.createElement("img");                          // (The card will have a title, a picture, and a description)
    let desc = document.createElement("p");
    title.appendChild(document.createTextNode(metaArray[index].title));
    img.src = gateway + 'ipfs/' + mainDB.articles[index]  + '/' + metaArray[index].cover;
    img.classList = "coverImage";
    desc.appendChild(document.createTextNode(metaArray[index].description));
  
    card.appendChild(title);                                          // Append the subcomponents to the card <div>
    card.appendChild(img);
    card.appendChild(desc);
  
    link.appendChild(card);                                          // Append card to link element (<a>)
    listElement.appendChild(link);                                   // Append link to list element (<li>)
  
    document.getElementById("articleList").appendChild(listElement); // Append to articleList, which is part of the current DOM
}

// Start downloading the list of articles and meta information (for Jasmine testing, turn this off)
//loadMain();
