const burger = document.querySelector(".burger");
const menu = document.querySelector(".navbar-menu");

burger.addEventListener("click", e => {
  menu.classList.toggle("is-active");
});
