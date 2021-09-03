async function displayCIDs() {
    document.getElementById("loading").style ="display: block";                         // Display loading screen
    document.getElementById("articleBox").style ="display: none";                       // Hide the content
    await loadDB();
    document.getElementById("loading").style = "display: none";                         // Hide loading screen
    document.getElementById("articleBox").style ="display: block";                      // Display the content

    document.getElementById("siteCID_text").textContent = mainDB.current_site_cid;
    document.getElementById("dbCID_text").textContent = mainDB.last_db_cid;             // The DB CID can't be the newest, because it's stored in the DB
    document.getElementById("articlesCID_text").textContent = mainDB.current_articles_cid;

    const copyDB = document.getElementById('copy_db_cid');
    const copyArticles = document.getElementById('copy_articles_cid');
    const copySite = document.getElementById('copy_site_cid');

    copyDB.onclick = () => navigator.clipboard.writeText(mainDB.last_db_cid);           // Copy to clipboard. Will not work in HTTP, only HTTPS
    copyArticles.onclick = () => navigator.clipboard.writeText(mainDB.current_articles_cid);
    copySite.onclick = () => navigator.clipboard.writeText(mainDB.current_site_cid);
    
    let qrSettings = {                                                                  // We need to change text for every instance
        text: mainDB.current_site_cid,                                                  // otherwise the settings are the same
        width: 260,
        height: 260,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    }

    let SiteQRCode = new QRCode(document.getElementById("siteCID_qr"), qrSettings);             // QR Code for Site CID (this is the website without the articles)

    qrSettings.text =mainDB.last_db_cid;
    let DBQRCode = new QRCode(document.getElementById("dbCID_qr"), qrSettings);                 // QR Code for DB CID (this is a JSON, contains list of articles and other meta)

    qrSettings.text = mainDB.last_db_cid;
    let ArticlesQRCode = new QRCode(document.getElementById("articlesCID_qr"), qrSettings);     // QR Code for Articles CID (this is a folder, articles are subfolders)
}
