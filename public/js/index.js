import { login, logout } from "./login";
import { displayMap } from "./leaflet";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";

// DOM ELEMENTS
let leaflet = document.getElementById("map");
let loginForm = document.querySelector(".form--login");
let logOutBtn = document.querySelector(".nav__el--logout");
let userDataForm = document.querySelector(".form-user-data");
let userPasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

// ELEMENT'S VALUE
if (logOutBtn) logOutBtn.addEventListener("click", logout);

if (leaflet) {
  let locations = JSON.parse(leaflet.dataset.locations);
  // console.log("locations: ", locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    login(email, password);
  });

if (userDataForm)
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "data");
  });

if (userPasswordForm)
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";

    let passwordCurrent = document.getElementById("password-current").value;
    let password = document.getElementById("password").value;
    let passwordConfirm = document.getElementById("password-confirm").value;
    // prettier-ignore
    await updateSettings({ passwordCurrent, password, passwordConfirm }, "password");

    document.querySelector(".btn--save-password").textContent = "Save Password";
    passwordCurrent = document.getElementById("password-current").value = "";
    password = document.getElementById("password").value = "";
    passwordConfirm = document.getElementById("password-confirm").value = "";
  });

if (bookBtn)
  bookBtn.addEventListener("click", (e) => {
    const { tourId } = e.target.dataset;
    console.log("tourId", tourId);
    console.log("tourId", e.target);
    bookTour(tourId);
  });
