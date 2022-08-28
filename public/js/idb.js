console.log("Loading idb.js here");

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let database;
const request = indexedDB.open("budget-tracker", 1);

request.onsuccess = ({ target }) => {
  database = target.result;
};

request.onupgradeneeded = (event) => {
  const database = event.target.result;
  database.createObjectStore("savedData", { autoIncrement: true });
};

function saveRecord(savedRecord) {
  const transaction = database.transaction(["savedData"], "readwrite");
  const store = transaction.objectStore("savedData");

  console.log("Saved in saveRecord: ", savedRecord);
  store.add(savedRecord);
}

function checkDB() {
  const transaction = database.transaction(["savedData"], "readwrite");
  const store = transaction.objectStore("savedData");
  const allRecords = store.getAll();

  allRecords.onsuccess = () => {
    if (allRecords.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(allRecords.result),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = database.transaction(["savedData"], "readWrite");
          const store = transaction.objectStore("savedData");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", checkDB);
