function openModal() {
    document.getElementById("chooseHelpFileModal").style = "display: block";
}

// Close the modal when user clicks outside the modal
var modal = document.getElementById('chooseHelpFileModal');
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
