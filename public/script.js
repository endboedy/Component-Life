function showPage(pageId) {
  // hide all pages
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  // show selected page
  document.getElementById(pageId).classList.add("active");
}

// default show compLife
showPage("compLife");
