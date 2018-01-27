let tweetBody = document.querySelector("#tweetBody");
console.log(tweetBody);

let button = document.querySelector(".update");

tweetBody.addEventListener("keyup", e => {
  tweetBody = e.target.textContent;
  console.log(tweetBody);
});

button.addEventListener("click", e => {
  getPromise(e);
});

function getPromise(e) {
  let id = e.target.id;

  let data = {
    tweetBody
  };

  var myHeaders = new Headers({
    "Content-Type": "application/json"
  });

  let request = new Request(`/tweets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: myHeaders
  });

  fetch(request)
    .then(res => {
      console.log(res);
      window.location.replace("/tweets");
    })
    .catch(e => {
      console.log(e);
    });
}

document.addEventListener("DOMContentLoaded", event => {
  tweetBody = tweetBody.textContent;
});
