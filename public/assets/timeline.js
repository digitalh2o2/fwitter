console.log("hi");
let info = document.getElementsByClassName("information");
let reveal = document.getElementsByClassName("reveal");

for (let i = 0; i < reveal.length; i++) {
  for (let x = 0; x < info.length; x++) {
    reveal[i].onclick = () => {
      if (info[i].style.display === "none") {
        info[i].style.display = "block";
      } else {
        info[i].style.display = "none";
      }
    };
  }
}
