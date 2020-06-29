class Transaction {
	constructor(description, amount, transactionId, percentage = 0) {
		this.description = description;
		this.amount = amount;
		this.transactionId = transactionId;
		this.percentage = percentage;
	}

	checkTransactionId(transactionId) {
		return this.transactionId == transactionId;
	}
}

class IncomeTransaction extends Transaction {
	constructor(description, amount, transactionId) {
		super(description, amount, transactionId);
	}
	html() {
		return ` <div class="item" data-transaction-id="${this.transactionId}">
			<div class="item__description">${this.description}</div>
			<div class="right">
				<div class="item__value"> +$${this.amount}</div>
				<div class="item__delete">
					<button class="item__delete--btn">
						<i class="ion-ios-close-outline"></i>
					</button>
				</div>
			</div>
		</div>`;
	}
}

class ExpenseTransaction extends Transaction {
	constructor(description, amount, transactionId, incomeTotal) {
		super(description, amount, transactionId);
		this.percentage = (amount / incomeTotal) * 100;
	}
	html() {
		return ` <div class="item" data-transaction-id="${this.transactionId}">
			<div class="item__description">${this.description}</div>
			<div class="right">
				<div class="item__value"> -$${Math.abs(this.amount)}</div>
					<div class="item__percentage">${this.percentage}%</div>
				<div class="item__delete">
					<button class="item__delete--btn">
						<i class="ion-ios-close-outline"></i>
					</button>
				</div>
			</div>
		</div>`;
	}
}

class TransactionList {
	constructor() {
		this.incomeList = [];
		this.expenseList = [];
		this.transactionId = 1;
	}

	getIncomeTotal() {
		var sum = 0;
		for (let i = 0; i < this.incomeList.length; i++) {
				sum += Math.abs(this.incomeList[i].amount);
		}
		return sum;
	}

	getExpenseTotal() {
		var sum = 0;
		for (let i = 0; i < this.expenseList.length; i++) {
				sum += Math.abs(this.expenseList[i].amount);
		}
		return sum;
	}

	getExpensePercentage() {
		const percentage = (this.getExpenseTotal() / this.getIncomeTotal()) * 100;
		return isNaN(percentage) ? 0 : percentage;
	}

	getAvailableBudget() {
		return this.getIncomeTotal() - this.getExpenseTotal();
	}

	addNewTransaction(description, amount) {
		if (amount >= 0) {
			// incomeList
			this.incomeList.unshift(
					new IncomeTransaction(description, amount, this.transactionId)
			);
		} else {
			// expenseList
			this.expenseList.unshift(
				new ExpenseTransaction(
					description,
					amount,
					this.transactionId,
					this.getIncomeTotal()
				)
			);
		}
		this.transactionId++;
	}

	removeTransaction(transactionId) {
		this.incomeList = this.incomeList.filter(
			(transaction) => !transaction.checkTransactionId(transactionId)
		);
		this.expenseList = this.expenseList.filter(
			(transaction) => !transaction.checkTransactionId(transactionId)
		);
	}

	incomeListHtml() {
		const transactionsHTML = this.incomeList.map((transaction) =>
			transaction.html()
		);
		return transactionsHTML.join("");
	}

	expenseListHtml() {
		const transactionsHTML = this.expenseList.map((transaction) =>
			transaction.html()
		);
		return transactionsHTML.join("");
	}
}

let transactionList;

// When submitted, add repair and empty input
function addItem() {
	const description = document.querySelector(".add__description").value;
	document.querySelector(".add__description").value = "";
	const amount = document.querySelector(".add__value").value;
	document.querySelector(".add__value").value = "";

	if (description.length && parseFloat(amount) != 0) {
			transactionList.addNewTransaction(description, amount);
	}

	renderHtml();
}

function deleteTransaction(e) {
    const transactionId =
        event.target.parentElement.parentElement.parentElement.parentElement.dataset
        .transactionId;
    transactionList.removeTransaction(transactionId);
    renderHtml();
}

// Function to set all event listeners
function setEventListeners() {
	const button = document.querySelector(".add__btn");
	button.addEventListener("click", addItem);

	// Delete buttons
	const buttons = document.querySelectorAll(".item__delete--btn");
	buttons.forEach((button) =>
			button.addEventListener("click", deleteTransaction)
	);
}

// Function to render html
function renderHtml() {
  // Set budget title month
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const d = new Date();

	const monthYear = monthNames[d.getMonth()] + " " + d.getFullYear();
	document.querySelector(".budget__title--month").innerHTML = monthYear;
	// Set budget value
	const budgetVal = transactionList.getAvailableBudget();
	const budgetValStr = `${budgetVal >= 0 ? "+" : "-"}$${Math.abs(budgetVal)}`;
	document.querySelector(".budget__value").innerHTML = budgetValStr;

	// Set budget income value
	const incomeVal = transactionList.getIncomeTotal();
	const incomeValStr = `${incomeVal >= 0 ? "+" : "-"}$${Math.abs(incomeVal)}`;
	document.querySelector(".budget__income--value").innerHTML = incomeValStr;

	// Set budget expense value
	const expenseVal = transactionList.getExpenseTotal();
	const expenseValStr = `${expenseVal >= 0 ? "+" : "-"}$${Math.abs(
	expenseVal
  )}`;
	document.querySelector(".budget__expenses--value").innerHTML = expenseValStr;

	// Set budget expense percentage
	const expensePercVal = transactionList.getExpensePercentage();
	const expensePercValStr = `${expensePercVal}%`;
	document.querySelector(
			".budget__expenses--percentage"
	).innerHTML = expensePercValStr;

	// Set all income
	const incomeCont = document.querySelector(".income__list");
	// Remove child elements
	let first = incomeCont.firstElementChild;
	while (first) {
			first.remove();
			first = incomeCont.firstElementChild;
	}
	incomeCont.insertAdjacentHTML("afterbegin", transactionList.incomeListHtml());
	// Set all expenses
	const expenseCont = document.querySelector(".expenses__list");
	// Remove child elements
	first = expenseCont.firstElementChild;
	while (first) {
			first.remove();
			first = expenseCont.firstElementChild;
	}
	expenseCont.insertAdjacentHTML(
			"afterbegin",
			transactionList.expenseListHtml()
	);

	// Set all event listeners
	setEventListeners();
}

function reset() {
	// Initialize repair list
	transactionList = new TransactionList();
	renderHtml();
}


window.addEventListener("DOMContentLoaded", (event) => {
	reset();
});