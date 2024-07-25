document.addEventListener("DOMContentLoaded", () => {
  const tradeForm = document.getElementById("trade-form");
  const tradeHistoryTable = document
    .getElementById("trade-history")
    .getElementsByTagName("tbody")[0];
  const clearTradesButton = document.getElementById("clear-trades");

  const db = firebase.firestore();
  const tradesRef = db.collection("trades");

  // Load trades from Firestore
  tradesRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      addTradeToTable(doc.data());
    });
  });

  tradeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const symbol = document.getElementById("symbol").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const price = parseFloat(document.getElementById("price").value);
    const total = quantity * price;

    const trade = { symbol, quantity, price, total };

    // Save trade to Firestore
    tradesRef.add(trade).then((docRef) => {
      addTradeToTable(trade);
    });

    tradeForm.reset();
  });

  clearTradesButton.addEventListener("click", () => {
    tradesRef.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        tradesRef.doc(doc.id).delete();
      });
      while (tradeHistoryTable.firstChild) {
        tradeHistoryTable.removeChild(tradeHistoryTable.firstChild);
      }
    });
  });

  function addTradeToTable(trade) {
    const newRow = tradeHistoryTable.insertRow();

    newRow.insertCell(0).innerText = trade.symbol;
    newRow.insertCell(1).innerText = trade.quantity;
    newRow.insertCell(2).innerText = trade.price.toFixed(2);
    newRow.insertCell(3).innerText = trade.total.toFixed(2);
  }
});
