

const steps = Array.from(document.querySelectorAll(".signup form .step"));
const nextBtn = document.querySelectorAll(".signup form .next-btn");
const prevBtn = document.querySelectorAll(".signup form .previous-btn");
const form = document.querySelector(".signup form");

nextBtn.forEach((button) => {
  button.addEventListener("click", () => {
    changeStep("next");
  });
});
prevBtn.forEach((button) => {
  button.addEventListener("click", () => {
    changeStep("prev");
  });
});

function changeStep(btn) {
  let index = 0;
  const active = document.querySelector(".active");
  index = steps.indexOf(active);
  steps[index].classList.remove("active");
  if (btn === "next") {
    index++;
  } else if (btn === "prev") {
    index--;
  }
  steps[index].classList.add("active");
}

const text = document.querySelector('.text p');
        text.innerHTML = text.innerText.split("").map(
            (char, i) =>
                `<span style="transform:rotate(${i * 8}deg)">${char}</span>`
        ).join("")

function onSignIn(GoogleUser) {
  // var id_token = GoogleUser.getAuthResponse(GoogleUser)	;
  console.log(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/glogin');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    //   console.log('Signed in as: ' + xhr.responseText);
    if (xhr.responseText == 'Success') {
      signOut();
      location.assign('/dashboard');
    }
  };
  xhr.send(JSON.stringify({ token: id_token }));
}


function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
}
