class MyPopup {
  constructor(texto, opcoes = {}) {
    this.texto = texto || ""
    this.id = opcoes.id || "myPopup-" + Date.now()
    this.className = opcoes.className || "my-popup"
    this.buttons = opcoes.buttons || []
    this.popupElement = null

    this._createPopup()
    this._adicionarAoBody()
  }
}

const popupContainer = document.getElementById("popupContainer")
const popupText = document.getElementById("popupText")
const popupButtonsContainer = document.getElementById("popupButtons")

const showPopupMessage = document.getElementById("showPopupMessage")
let popupTimeout

export default async function showCustomPopup(text, showButtons = false, func = null) {
  clearTimeout(popupTimeout)
  let buttonReturn

  popupText.textContent = text
  popupButtonsContainer.innerHTML = ""

  if (showButtons == true) {
    myButtonsList.forEach((buttonData) => {
      const button = document.createElement("button")
      button.textContent = buttonData.text
      button.className = `myButton01 ${buttonData.className || ""}`
      button.addEventListener("click", () => {
        if (buttonData.text == "Sim") {
          func()
        }

        toogleFadeAnimation(popupContainer, "out")
        hideCustomPopup()
      })
      popupButtonsContainer.appendChild(button)
    })
  }

  popupContainer.style.visibility = "visible"
  toogleFadeAnimation(popupContainer, "in")

  if (showButtons == false) {
    popupTimeout = setTimeout(() => {
      toogleFadeAnimation(popupContainer, "out")

      popupTimeout = setTimeout(() => {
        hideCustomPopup()
      }, 50)
    }, 4000)
  }

  return buttonReturn
}

function toogleFadeAnimation(popupContainer, action = "out") {
  if (action == "in") {
    popupContainer.classList.remove("fade-out")
    popupContainer.classList.add("fade-in")
  } else {
    popupContainer.classList.remove("fade-in")
    popupContainer.classList.add("fade-out")
  }
}

function hideCustomPopup() {
  popupContainer.style.visibility = "hidden"
  clearTimeout(popupTimeout)
}

const myButtonsList = [
  {
    text: "Não",
    className: "cancel",
    action: () => {
      return false
    },
  },
  {
    text: "Sim",
    className: "confirm",
    action: () => {
      return true
    },
  },
]

showPopupMessage.addEventListener("click", () => {
  showCustomPopup("Funcionalidade para cálculo de estatística será adicionado em breve!", [])
})
