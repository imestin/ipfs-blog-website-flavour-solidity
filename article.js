var gateway = gateway || 'https://ipfs.io/';

async function contentLoader() {
    document.getElementById("loading").style ="display: block";                         // Display loading screen
    let urlParams = new URLSearchParams(location.search);                               // Get the CID from the URL
    let cid = urlParams.get('cid');
    
    let mdText = await fetch(gateway + 'ipfs/' + cid + '/article.md').then(response => response.text())
    let article = document.getElementById("articleBox");                                // This will be the main content
    document.getElementById("loading").style = "display: none";                         // Hide loading screen

	marked.setOptions({																	// Sets the article folder as base url
		baseUrl: 'https://ipfs.io/' + 'ipfs/' + cid + '/'
	})
	article.innerHTML = marked(mdText);													// Parse markdown 

    let metaObj = await fetchMeta(cid);                                                 // We load this secondly, because fetch might take a lot of time and this is just meta
    document.title = metaObj.title;
}

contentLoader();