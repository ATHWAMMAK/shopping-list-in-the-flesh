
const itemInput = document.getElementById("item-input");
const priceInput = document.getElementById("price-input");
const addButton = document.getElementById("add-button");
const shoppingList = document.getElementById("shopping-list");
const markPurchasedButton = document.getElementById("mark-purchased-button");
const clearButton = document.getElementById("clear-button");


const totalDisplay = document.createElement("p");
totalDisplay.id = "total-cost";
totalDisplay.textContent = "Total Cost: 0.00";
shoppingList.after(totalDisplay);

let shoppingItems = [];

try {
    const savedItems = localStorage.getItem("shoppingItems");

    if (savedItems) {
        const parsedItems = JSON.parse(savedItems);

        if (Array.isArray(parsedItems)) {
            shoppingItems = parsedItems.filter(function (item) {
                return (
                    item &&
                    typeof item.name === "string" &&
                    item.name.trim() !== "" &&
                    Number.isFinite(item.price) &&
                    item.price >= 0 &&
                    typeof item.purchased === "boolean"
                );
            });
        }
    }
} catch (error) {
    console.error("Could not load the saved shopping list:", error);
}




function saveItems() {
    try {
        localStorage.setItem(
            "shoppingItems",
            JSON.stringify(shoppingItems)
        );
    } catch (error) {
        alert("Unable to save your shopping list in this browser.");
        console.error("Could not save shopping list:", error);
    }
}




function renderShoppingList() {
    shoppingList.innerHTML = "";

    shoppingItems.forEach(function (item, index) {
        // Create the list item
        const listItem = document.createElement("li");

        if (item.purchased) {
            listItem.classList.add("purchased");
        }

        // Create checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = item.purchased;
        checkbox.setAttribute("aria-label", "Mark " + item.name + " as purchased");

        // Create item name
        const nameSpan = document.createElement("span");
        nameSpan.className = "item-name";
        nameSpan.textContent = item.name;

        // Create item price
        const priceSpan = document.createElement("span");
        priceSpan.className = "item-price";
        priceSpan.textContent = " - " + item.price.toFixed(2);

        // Create Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";
        editButton.dataset.index = index;

        // Create Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.dataset.index = index;

        // Add elements to the list item
        listItem.appendChild(checkbox);
        listItem.appendChild(nameSpan);
        listItem.appendChild(priceSpan);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        // Add the item to the shopping list
        shoppingList.appendChild(listItem);
    });

    updateTotal();
}




addButton.addEventListener("click", function () {
    const itemName = itemInput.value.trim();
    const priceValue = priceInput.value.trim();
    const itemPrice = Number(priceValue);

    
    if (itemName === "") {
        alert("Please enter a shopping item.");
        return;
    }


    if (
        priceValue === "" ||
        !Number.isFinite(itemPrice) ||
        itemPrice < 0
    ) {
        alert("Please enter a valid price.");
        return;
    }

    
    const newItem = {
        name: itemName,
        price: itemPrice,
        purchased: false
    };

    
    shoppingItems.push(newItem);

    
    saveItems();
    renderShoppingList();

    
    itemInput.value = "";
    priceInput.value = "";
    itemInput.focus();
});



shoppingList.addEventListener("change", function (event) {
    if (event.target.classList.contains("item-checkbox")) {
        const listItem = event.target.closest("li");
        const index = Array.from(shoppingList.children).indexOf(listItem);

        if (index !== -1) {
            shoppingItems[index].purchased = event.target.checked;

            saveItems();
            renderShoppingList();
        }
    }
});



markPurchasedButton.addEventListener("click", function () {
    shoppingItems.forEach(function (item) {
        item.purchased = true;
    });

    saveItems();
    renderShoppingList();
});




shoppingList.addEventListener("click", function (event) {
    const listItem = event.target.closest("li");

    if (!listItem) {
        return;
    }

    const index = Array.from(shoppingList.children).indexOf(listItem);

    if (index === -1) {
        return;
    }

    
    if (event.target.classList.contains("edit-button")) {
        const item = shoppingItems[index];

        const newName = prompt("Enter the new item name:", item.name);

        
        if (newName === null) {
            return;
        }

        if (newName.trim() === "") {
            alert("The item name cannot be empty.");
            return;
        }

        const newPrice = prompt("Enter the new item price:", item.price);

        if (newPrice === null) {
            return;
        }

        const parsedPrice = Number(newPrice.trim());

        if (
            newPrice.trim() === "" ||
            !Number.isFinite(parsedPrice) ||
            parsedPrice < 0
        ) {
            alert("Please enter a valid price.");
            return;
        }

        
        item.name = newName.trim();
        item.price = parsedPrice;

        saveItems();
        renderShoppingList();
    }

    
    if (event.target.classList.contains("delete-button")) {
        const confirmed = confirm(
            "Are you sure you want to delete " +
            shoppingItems[index].name +
            "?"
        );

        if (confirmed) {
            shoppingItems.splice(index, 1);

            saveItems();
            renderShoppingList();
        }
    }
    });


clearButton.addEventListener("click", function () {
    if (shoppingItems.length === 0) {
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to clear the entire shopping list?"
    );

    if (confirmed) {
        shoppingItems = [];

        saveItems();
        renderShoppingList();
    }
});




function updateTotal() {
    let total = 0;

    shoppingItems.forEach(function (item) {
        if (item.purchased) {
            total += item.price;
        }
    });

    totalDisplay.textContent = "Total Cost: " + total.toFixed(2);
}


renderShoppingList();