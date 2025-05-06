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
const tableHeaders = document.querySelectorAll("th")

const today = new Date().toISOString().split("T")[0]
datepicker.value = today

let timesRendered = 0
let editingIndex = null
let currentDatabase = []
let currentlySortedHeader = null
let sortOrder = "ascending"
const databaseLink =
  "https://gist.githubusercontent.com/HugoAlbuquerque1993/468afa0fb1339b65a4c8ca82e7bb9e3d/raw/aa726e65097556519492e32266f6aadcd344abab/gistfile1.json"
const SESSION_STORAGE_KEY = "sessionDatabase"

function loadDatabase() {
  const sessionDatabase = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (sessionDatabase) {
    currentDatabase = JSON.parse(sessionDatabase)
    console.log("Dados carregados do sessionStorage: ", currentDatabase)
    renderAttendanceData()
  } else {
    fetch(databaseLink)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
        console.log("Chamada HTTP realizada! Dados armazenados ao sessionStorage: ", data)
        currentDatabase = data
        renderAttendanceData()
      })
      .catch((error) => {
        console.error("Erro ao carregar os dados:", error)
      })
  }
}

window.onload = loadDatabase

function sortList(criterion = "start", order = "descending") {
  const sortedList = [...currentDatabase]
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
  currentDatabase = sortedList
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

  sortOrder = currentlySortedHeader === header && sortOrder === "ascending" ? "descending" : "ascending"
  currentlySortedHeader = header
  sortIcon.textContent = sortOrder === "ascending" ? "▼" : "▲"
  header.classList.remove("sorted-desc", "sorted-asc")
  header.classList.add(sortOrder === "ascending" ? "sorted-asc" : "sorted-desc")

  sortList(criterion, sortOrder)
  renderAttendanceData()
}

function renderAttendanceData() {
  timesRendered++
  attendanceDataBody.innerHTML = ""
  currentDatabase.forEach((employee, index) => {
    const row = attendanceDataBody.insertRow()
    row.dataset.index = index
    row.addEventListener("click", () => openEditModal(index))

    const cells = [employee.name, employee.start, employee.intervalStart, employee.intervalEnd, employee.end]
    cells.forEach((text) => {
      const cell = row.insertCell()
      cell.textContent = text
    })
  })
}

function openEditModal(index) {
  editingIndex = index
  const employeeData = currentDatabase[index]
  document.getElementById("editName").value = employeeData.name
  document.getElementById("editStart").value = employeeData.start
  document.getElementById("editIntervalStart").value = employeeData.intervalStart
  document.getElementById("editIntervalEnd").value = employeeData.intervalEnd
  document.getElementById("editEnd").value = employeeData.end
  editModal.style.display = "block"
}

function closeEditModal() {
  editModal.style.display = "none"
  editingIndex = null
}

saveEditButton.addEventListener("click", () => {
  if (editingIndex !== null) {
    const newStart = document.getElementById("editStart").value
    const newIntervalStart = document.getElementById("editIntervalStart").value
    const newIntervalEnd = document.getElementById("editIntervalEnd").value
    const newEnd = document.getElementById("editEnd").value

    currentDatabase[editingIndex] = {
      ...currentDatabase[editingIndex],
      start: newStart,
      intervalStart: newIntervalStart,
      intervalEnd: newIntervalEnd,
      end: newEnd,
    }

    renderAttendanceData()
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
    currentDatabase.splice(editingIndex, 1)
    renderAttendanceData()
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
  const newIntervalStart = document.getElementById("addIntervalStart").value
  const newIntervalEnd = document.getElementById("addIntervalEnd").value
  const newEnd = document.getElementById("addEnd").value

  if (newName && newStart && newIntervalStart && newIntervalEnd && newEnd) {
    currentDatabase.push({
      name: newName,
      start: newStart,
      intervalStart: newIntervalStart,
      intervalEnd: newIntervalEnd,
      end: newEnd,
    })
    closeAddModalFunc()
    renderAttendanceData()

    document.getElementById("addName").value = ""
    document.getElementById("addStart").value = ""
    document.getElementById("addIntervalStart").value = ""
    document.getElementById("addIntervalEnd").value = ""
    document.getElementById("addEnd").value = ""
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
  console.log(sideMenu[0].children[0].classList)
})
