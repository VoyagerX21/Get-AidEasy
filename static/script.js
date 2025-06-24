const searchInput = document.getElementById("searchInput");
const dropdown = document.getElementById("dropdown");
const searchicon = document.getElementById("searchIcon");
let currentHighlight = -1;
let filteredCategories = [];

function openModal() {
  document.getElementById("coffeeOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById("coffeeOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

function copyUPI() {
  const upiId = document.getElementById("upiId").textContent;
  navigator.clipboard
    .writeText(upiId)
    .then(() => {
      const element = document.getElementById("upiId");
      const originalText = element.textContent;
      const originalBg = element.style.background;

      element.style.background = "linear-gradient(135deg, #28a745, #20c997)";
      element.style.color = "white";
      element.textContent = "✓ Copied to clipboard!";

      setTimeout(() => {
        element.style.background = originalBg;
        element.style.color = "#333";
        element.textContent = originalText;
      }, 2000);
    })
    .catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = upiId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      alert("UPI ID copied to clipboard!");
    });
}

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

document.addEventListener("click", function (e) {
  const btn = document.querySelector(".icon-menu");
  const menu = document.getElementById("dropdownMenu");
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = "none";
  }
});

function filterCategories(query) {
  if (!query.trim()) {
    return courses;
  }

  return courses.filter(
    (category) =>
      category.title.toLowerCase().includes(query.toLowerCase()) ||
      category.Organization.toLowerCase().includes(query.toLowerCase())
  );
}

function renderDropdown(items) {
  if (items.length === 0) {
    dropdown.innerHTML = '<div class="no-results">No courses found</div>';
    return;
  }

  dropdown.innerHTML = items
    .filter(
      (item) => !item.Modules.Courses.toLowerCase().includes("course series")
    )
    .map(
      (item) => `
    <div class="dropdown-item" data-index="${item.FIELD1}">
      <div class="item-text">${item.title}</div>
      <div class="item-category">${item.Organization}</div>
    </div>
  `
    )
    .join("");

  // Add click handlers
  dropdown.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", () => {
      const field1 = item.dataset.index;
      const selectedItem = items.find((i) => String(i.FIELD1) === field1);
      if (selectedItem) {
        selectItem(selectedItem);
      } else {
        console.error("Item with FIELD1 not found:", field1);
      }
    });
  });
}

function showDropdown() {
  dropdown.classList.add("show");
}

function hideDropdown() {
  dropdown.classList.remove("show");
  currentHighlight = -1;
}

function selectItem(item) {
  searchInput.value = item.title;
  console.log(item);
  // document.getElementById("CategorySearch").value = item.Organization;
  // searchicon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>'
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.style.cssText =
    "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;";
  loader.innerHTML =
    '<div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div><style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}</style>';
  document.body.appendChild(loader);
  fetch("/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      obj: item,
    }),
  })
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("loader").remove();
      document.open();
      document.write(html);
      document.close();
    });
  hideDropdown();
  // searchInput.blur();

  // searchInput.style.background = 'rgba(76, 175, 80, 0.1)';
  // setTimeout(() => {
  //     searchInput.style.background = 'rgba(255, 255, 255, 0.95)';
  // }, 200);
}

function highlightItem(index) {
  const items = dropdown.querySelectorAll(".dropdown-item");
  items.forEach((item) => item.classList.remove("highlighted"));

  if (index >= 0 && index < items.length) {
    items[index].classList.add("highlighted");
    items[index].scrollIntoView({ block: "nearest" });
  }
}

searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  filteredCategories = filterCategories(query);
  renderDropdown(filteredCategories);
  showDropdown();
  currentHighlight = -1;
});

searchInput.addEventListener("focus", () => {
  const query = searchInput.value;
  filteredCategories = filterCategories(query);
  renderDropdown(filteredCategories);
  showDropdown();
});

searchInput.addEventListener("blur", (e) => {
  setTimeout(() => {
    if (!dropdown.contains(document.activeElement)) {
      hideDropdown();
    }
  }, 150);
});

searchInput.addEventListener("keydown", (e) => {
  const items = dropdown.querySelectorAll(".dropdown-item");

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      currentHighlight = Math.min(currentHighlight + 1, items.length - 1);
      highlightItem(currentHighlight);
      break;

    case "ArrowUp":
      e.preventDefault();
      currentHighlight = Math.max(currentHighlight - 1, -1);
      highlightItem(currentHighlight);
      break;

    case "Enter":
      e.preventDefault();
      if (currentHighlight >= 0 && items[currentHighlight]) {
        const field1 = items[currentHighlight].dataset.index;
        const selectedItem =
          filteredCategories.find((i) => String(i.FIELD1) === field1) ||
          items.find((i) => String(i.FIELD1) === field1);
        if (selectedItem) {
          selectItem(selectedItem);
        } else {
          console.error("Item with FIELD1 not found:", field1);
        }
      }
      break;

    case "Escape":
      hideDropdown();
      searchInput.blur();
      break;
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".input-container")) {
    hideDropdown();
  }
});
