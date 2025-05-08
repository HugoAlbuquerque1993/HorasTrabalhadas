/**
 * @param {Document} document
 */

class myPopup {
  constructor(text, id, buttons = false) {
    this.text = text
    this.id = id
    this.buttons = buttons
    this.element = this.createElement()
  }
  createElement() {}
}

export default function instacePopup(document) {
  const popupContainer = document.getElementById("popupContainer")
  const popupText = document.getElementById("popupText")
  const popupButtonsContainer = document.getElementById("popupButtons")

  const showPopupButtonWithOptions = document.getElementById("showPopupButtonWithOptions")
  const showPopupMessage = document.getElementById("showPopupMessage")
  let popupTimeout

  function showCustomPopup(text, buttons = []) {
    clearTimeout(popupTimeout)

    popupText.textContent = text
    popupButtonsContainer.innerHTML = ""

    if (buttons && buttons.length > 0) {
      buttons.forEach((buttonData) => {
        const button = document.createElement("button")
        button.textContent = buttonData.text
        button.className = `myButton01 ${buttonData.class || ""}`
        button.addEventListener("click", () => {
          if (buttonData.action) {
            buttonData.action()
          }
          toogleFadeAnimation(popupContainer, "out")
          hideCustomPopup()
        })
        popupButtonsContainer.appendChild(button)
      })
    }

    popupContainer.style.visibility = "visible"
    toogleFadeAnimation(popupContainer, "in")

    if (buttons.length < 1) {
      popupTimeout = setTimeout(() => {
        toogleFadeAnimation(popupContainer, "out")

        popupTimeout = setTimeout(() => {
          hideCustomPopup()
        }, 50)
      }, 4000)
    }
  }

  function toogleFadeAnimation(thisElement, action = "out") {
    if (action == "in") {
      popupContainer.classList.remove("fade-out")
      popupContainer.classList.add("fade-in")
    }
    if (action == "out") {
      popupContainer.classList.remove("fade-in")
      popupContainer.classList.add("fade-out")
    }
  }

  function hideCustomPopup() {
    popupContainer.style.visibility = "hidden"
    clearTimeout(popupTimeout)
  }

  showPopupButtonWithOptions.addEventListener("click", () => {
    showCustomPopup("Deseja analisar o feedback diário?", [
      { text: "Não", class: "cancel", action: () => console.log("Cancelado!") },
      { text: "Sim", class: "confirm", action: () => console.log("Confirmado!") },
    ])
  })

  showPopupMessage.addEventListener("click", () => {
    showCustomPopup("Funcionalidade para cálculo de estatística será adicionado em breve!", [])
  })
}
