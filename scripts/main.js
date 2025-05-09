import myPopup from "./instancePopup.js"

const datepicker = document.getElementById("datepicker")
const attendanceDataBody = document.getElementById("attendance-data")
const editModal = document.getElementById("editModal")
const closeModal = document.getElementById("closeModal")
const saveEditButton = document.getElementById("saveEdit")
const cancelEditButton = document.getElementById("cancelEdit")
const deleteButton = document.getElementById("deleteUser")
const addModal = document.getElementById("addModal")
const closeAddModal = document.getElementById("closeAddModal")
const cancelAddButton = document.getElementById("cancelAdd")
const addEmployeeButtonElement = document.getElementById("addEmployee")
const showAddModalButton = document.getElementById("add-employee-button")
const tableHeaders = document.querySelectorAll("#attendance-table th")
const equalizeSchedule = document.getElementById("equalizeSchedule")

function autocompleteTimeInputs() {
  const popupWarnning =
    "Esta ação trocará o horário de todos os colaboradores. Tem certeza que deseja continuar? OBS: Ação irreversível!"

  let setStart = ""
  let setEnd = ""
  let setRunningtime = false

  const config = {
    hoursPerDay: 24,
    minutesPerHour: 60,
    caracterLimit: 2,
    handleHours: "hours",
    handleMinutes: "minutes",
  }

  function limitField(el) {
    let input = el.target

    if (input.type == "checkbox") {
      setRunningtime = input.checked
      return
    }

    if (input.value.length > 2) {
      input.value = null
    }

    if (input.value > config.hoursPerDay && input.dataset.handletime == config.handleHours) {
      input.value = config.hoursPerDay
    }

    if (input.value > config.minutesPerHour && input.dataset.handletime == "minutes") {
      input.value = config.minutesPerHour
    }
  }

  const inputs = equalizeSchedule.querySelectorAll("input")
  inputs.forEach((input) => {
    input.addEventListener("input", limitField)
  })

  sectorConfig.standardWorkSchedule.forEach((time, index) => {
    inputs[index].value = time
  })

  const button = equalizeSchedule.querySelector("button")
  button.addEventListener("click", () => {
    let inputsValue = []
    inputs.forEach((el) => {
      inputsValue.push(el.value)
    })

    setStart = formatTime(inputsValue[0], inputsValue[1])
    setEnd = formatTime(inputsValue[2], inputsValue[3])

    myPopup(popupWarnning, true, equalizeScheduleAction)
  })

  function equalizeScheduleAction() {
    sortList()

    let newTimeBank = [...employeesTimeBank]
    newTimeBank.forEach((employee) => {
      employee.start = setStart
      employee.end = setEnd
      employee.runningtime = setRunningtime
    })

    employeesTimeBank = newTimeBank
    loadAttendanceData()

    setTimeout(() => {
      myPopup("Horários alterados com sucesso!")
    }, 1000)
  }
}

const today = new Date().toISOString().split("T")[0]
datepicker.value = today

const myEndpoints = {
  sectorPath: "./database/sectorConfig.JSON",
  databasePath: "./database/timeBank.JSON",
  databaseLink:
    "https://gist.githubusercontent.com/HugoAlbuquerque1993/468afa0fb1339b65a4c8ca82e7bb9e3d/raw/a94bdd4fd373fbb07e2eff32fe2a53dea6781e62/gistfile1.json",
}

let renderedTimesBySession = 0
let editingIndex = null
let currentlySortedHeader = null
let sortOrder = "ascending"
let sectorConfig = {}
let timeBank = {}
let employeesTimeBank = []
let minutesRequirePerWorkday = 0
let popupButtons = {}

const gettingStarted = async () => {
  try {
    sectorConfig = await loadPathfile(myEndpoints.sectorPath)
    timeBank = await loadPathfile(myEndpoints.databasePath)

    employeesTimeBank = timeBank.employees
    minutesRequirePerWorkday = handleMinutesWorkay()

    autocompleteTimeInputs()
    loadAttendanceData()
  } catch (error) {
    handleFetchError()
    throw new Error(error)
  }
}

function handleFetchError() {
  const trError = attendanceDataBody.insertRow()
  const tdError = trError.insertCell()
  tdError.classList.add("tdError")
  tdError.setAttribute("colspan", "5")
  tdError.innerHTML = "Erro ao carregar banco de dados"
}

window.onload = gettingStarted

async function loadPathfile(url) {
  let response = await fetch(url)

  if (!response.ok) {
    throw new Error("Request error: ", response.status)
  }

  let data = await response.json()
  return data
}

// const SESSION_STORAGE_KEY = "sessionDatabase"
// function loadDatabase() {
//   const sessionDatabase = sessionStorage.getItem(SESSION_STORAGE_KEY)
//   if (sessionDatabase) {
//     employeesTimeBank = JSON.parse(sessionDatabase)
//     console.log("Dados carregados do sessionStorage: ", employeesTimeBank)
//     loadAttendanceData()
//   } else {
//     fetch(myEndpoints.databaseLink)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`Erro na requisição: ${response.status}`)
//         }
//         return response.json()
//       })
//       .then((data) => {
//         sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
//         console.log("Chamada HTTP realizada! Dados armazenados ao sessionStorage: ", data)
//         employeesTimeBank = data
//         loadAttendanceData()
//       })
//       .catch((error) => {
//         console.error("Erro ao carregar os dados:", error)
//       })
//   }
// }
// window.onload = loadDatabase

function sortList(criterion = "start", order = "descending") {
  const sortedList = [...employeesTimeBank]
  sortedList.sort((a, b) => {
    let valueA, valueB

    if (criterion === "name") {
      valueA = a.name.toUpperCase()
      valueB = b.name.toUpperCase()
    } else if (criterion) {
      const timeA = a[criterion].split(":").map(Number)
      const timeB = b[criterion].split(":").map(Number)
      valueA = timeA[0] * 60 + timeA[1]
      valueB = timeB[0] * 60 + timeB[1]
    } else {
      console.error("Invalid sort criterion.")
      return 0
    }

    const isAscending = order === "ascending" || order === "topToBottom"
    const isDescending = order === "descending" || order === "bottomToTop"

    if (isAscending) {
      if (valueA > valueB) return 1
      if (valueA < valueB) return -1
      return 0
    } else if (isDescending) {
      if (valueA < valueB) return 1
      if (valueA > valueB) return -1
      return 0
    } else {
      console.error("Invalid sort order.")
      return 0
    }
  })
  employeesTimeBank = sortedList
}

tableHeaders.forEach((header) => {
  const originalText = header.textContent
  header.innerHTML = `${originalText} <span class="sort-icon"></span>`
  header.addEventListener("click", handleTableHeaderClick)
})

function handleTableHeaderClick(event) {
  const header = event.currentTarget
  const criterion = header.dataset.th
  if (!criterion) return

  const sortIcon = header.querySelector(".sort-icon")

  if (currentlySortedHeader && currentlySortedHeader !== header) {
    const previousSortIcon = currentlySortedHeader.querySelector(".sort-icon")
    previousSortIcon.textContent = ""
    currentlySortedHeader.classList.remove("sorted-asc", "sorted-desc")
  }

  sortOrder =
    currentlySortedHeader === header && sortOrder === "ascending" ? "descending" : "ascending"
  currentlySortedHeader = header
  sortIcon.textContent = sortOrder === "ascending" ? "▼" : "▲"
  header.classList.remove("sorted-desc", "sorted-asc")
  header.classList.add(sortOrder === "ascending" ? "sorted-asc" : "sorted-desc")

  sortList(criterion, sortOrder)
  loadAttendanceData()
}

function loadAttendanceData() {
  renderedTimesBySession++
  attendanceDataBody.innerHTML = ""

  employeesTimeBank.forEach((employee, index) => {
    const row = attendanceDataBody.insertRow()
    row.classList.add("employeeRow")
    row.dataset.index = index
    row.addEventListener("click", () => openEditModal(index))
    employee.overtime = handleCalculateOvertime(employee)

    if (employee.warning) row.classList.add("warning")

    const cells = [
      employee.name,
      employee.start,
      employee.runningtime,
      employee.end,
      employee.overtime,
    ]

    cells.forEach((text) => {
      const cell = row.insertCell()
      cell.textContent = text
    })
  })
}

function timeStringToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

function formatTime(hours, minutes) {
  const formattedHours = String(hours).padStart(2, "0")
  const formattedMinutes = String(minutes).padStart(2, "0")
  return `${formattedHours}:${formattedMinutes}`
}

function identifyWeekDayString(dateString) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const parts = dateString.split("/")
  if (parts.length !== 3) {
    return "Invalid date format"
  }

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)

  const dateObject = new Date(year, month, day)

  if (isNaN(dateObject)) {
    return "Invalid date"
  }

  const dayOfWeekIndex = dateObject.getDay()
  const thisWeekDayString = daysOfWeek[dayOfWeekIndex]
  return thisWeekDayString
}

function handleMinutesWorkay() {
  const thisWeekDayString = identifyWeekDayString(timeBank.storedDay)
  const totalMinutes = sectorConfig.hoursPerWorkday[thisWeekDayString] * 60
  return totalMinutes
}

function handleCalculateOvertime(employee) {
  const startTimeInMinutes = timeStringToMinutes(employee.start)
  const endTimeInMinutes = timeStringToMinutes(employee.end)

  let differenceInMinutes = endTimeInMinutes - startTimeInMinutes

  let runningtime = employee.runningtime.toUpperCase()
  if (employee.runningtime != runningtime) {
    differenceInMinutes -= sectorConfig.breakTime
  }

  if (differenceInMinutes < minutesRequirePerWorkday) {
    employee.warning = true
    return "00:00"
  } else {
    employee.warning = null
  }

  if (differenceInMinutes < 0) {
    differenceInMinutes += 24 * 60
  }

  differenceInMinutes -= minutesRequirePerWorkday

  const differenceHours = Math.floor(differenceInMinutes / 60)
  const differenceMinutes = differenceInMinutes % 60

  return formatTime(differenceHours, differenceMinutes)
}

function openEditModal(index) {
  editingIndex = index
  const employeeData = employeesTimeBank[index]
  document.getElementById("editName").value = employeeData.name
  document.getElementById("editStart").value = employeeData.start
  document.getElementById("editRunningtime").value = employeeData.runningtime
  document.getElementById("editEnd").value = employeeData.end
  document.getElementById("editOvertime").value = employeeData.overtime
  editModal.style.display = "block"
}

function closeEditModal() {
  editModal.style.display = "none"
  editingIndex = null
}

saveEditButton.addEventListener("click", () => {
  if (editingIndex !== null) {
    const newStart = document.getElementById("editStart").value
    const newRunningtime = document.getElementById("editRunningtime").value
    const newEnd = document.getElementById("editEnd").value
    const newOvertime = document.getElementById("editOvertime").value

    employeesTimeBank[editingIndex] = {
      ...employeesTimeBank[editingIndex],
      start: newStart,
      runningtime: newRunningtime,
      end: newEnd,
      overtime: newOvertime,
    }

    loadAttendanceData()
    closeEditModal()
  }
})

closeModal.addEventListener("click", closeEditModal)
cancelEditButton.addEventListener("click", closeEditModal)
window.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeEditModal()
  }
})

deleteButton.addEventListener("click", () => {
  if (editingIndex !== null) {
    employeesTimeBank.splice(editingIndex, 1)
    loadAttendanceData()
    closeEditModal()
  }
})

showAddModalButton.addEventListener("click", () => {
  addModal.style.display = "block"
})

function closeAddModalFunc() {
  addModal.style.display = "none"
}

closeAddModal.addEventListener("click", closeAddModalFunc)
cancelAddButton.addEventListener("click", closeAddModalFunc)
window.addEventListener("click", (event) => {
  if (event.target === addModal) {
    closeAddModalFunc()
  }
})

addEmployeeButtonElement.addEventListener("click", () => {
  const newName = document.getElementById("addName").value
  const newStart = document.getElementById("addStart").value
  const newRunningtime = document.getElementById("addRunningtime").value
  const newEnd = document.getElementById("addEnd").value
  const newOvertime = document.getElementById("addOvertime").value

  if (newName && newStart && newRunningtime && newEnd && newOvertime) {
    employeesTimeBank.push({
      name: newName,
      start: newStart,
      runningtime: newRunningtime,
      end: newEnd,
      overtime: newOvertime,
    })
    closeAddModalFunc()
    loadAttendanceData()

    document.getElementById("addName").value = ""
    document.getElementById("addStart").value = ""
    document.getElementById("addRunningtime").value = ""
    document.getElementById("addEnd").value = ""
    document.getElementById("addOvertime").value = ""
  } else {
    alert("Por favor, preencha todos os campos!")
  }
})

datepicker.addEventListener("change", (event) => {
  console.log("Data alterada: ", event.target.value)
})

const sideMenu = document.getElementsByClassName("side-menu")
const sideMenuButton = document.getElementById("side-menu-button")
sideMenuButton.addEventListener("click", () => {
  sideMenu[0].classList.toggle("hidden")
  sideMenu[0].children[0].classList.toggle("rotated")
})
