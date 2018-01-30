let heart = document.getElementsByClassName("favorite");
let clicked = document.getElementsByClassName("information");

for (let i = 0; i < heart.length; i++) {
  for (let x = 0; x < clicked.length; x++) {
    heart[i].onclick = e => {
      let box = e.path[3].children["0"];
      let target = e.path[3].id;
      favorite(target, box);
    };
  }
}

function favorite(target, box) {
  let id = target;

  if (box.innerHTML === "true") {
    box.innerHTML = "false";
  } else {
    box.innerHTML = "true";
  }

  let data = {
    favorited: box.innerHTML
  };

  var myHeaders = new Headers({
    "Content-Type": "application/json"
  });

  let request = new Request(`/timeline/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: myHeaders
  });

  fetch(request)
    .then(res => {
      window.location.reload(true);
    })
    .catch(e => {
      console.log(e);
    });
}
