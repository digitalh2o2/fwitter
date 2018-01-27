console.log("hi d");
let button = document.querySelector(".deleteTweet");

button.addEventListener("click", e => {
  deleteTweet(e);
});

function deleteTweet(e) {
  var message = confirm("Are you sure? This can not be undone.");
  if (!message) {
    return console.log("no");
  }

  let id = e.target.id;

  let myHeaders = new Headers({
    "Content-Type": "application/json"
  });

  let request = new Request(`/tweets/${id}/delete`, {
    method: "DELETE",
    headers: myHeaders
  });

  fetch(request)
    .then(res => {
      window.location.replace("/tweets");
      alert("Tweet Deleted!");
    })
    .catch(e => {
      res.send("Error", e);
    });
}
