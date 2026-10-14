

const itemInput = document.getElementById("item-input");
const priceInput = document.getElementById("price-input");
const addButton = document.getElementById("add-button");
const shoppingList = document.getElementById("shopping-list");
const markPurchasedButton = document.getElementById("mark-purchased-button");
const clearButton = document.getElementById("clear-button");


const messageDisplay = document.createElement("p");

messageDisplay.id = "shopping-message";
messageDisplay.setAttribute("role", "status");
messageDisplay.setAttribute("aria-live", "polite");

shoppingList.before(messageDisplay);


// Display messages without using alert()
function showMessage(message, type = "success") {
    messageDisplay.textContent = message;
    messageDisplay.className = type;
}




const summaryDisplay = document.createElement("div");

summaryDisplay.id = "cost-summary";

summaryDisplay.innerHTML = `
    <p>Full List Total: <span id="full-total">0.00</span></p>
    <p>Purchased Total: <span id="purchased-total">0.00</span></p>
    <p>Remaining to Spend: <span id="remaining-total">0.00</span></p>
`;

shoppingList.after(summaryDisplay);




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
                    typeof item.price === "number" &&
                    Number.isFinite(item.price) &&
                    item.price >= 0 &&
                    typeof item.purchased === "boolean"
                );
            });
        }
    }
} catch (error) {
    console.error("Unable to load shopping list:", error);
    showMessage(
        "The saved shopping list could not be loaded.",
        "error"
    );
}




function saveItems() {
    try {
        localStorage.setItem(
            "shoppingItems",
            JSON.stringify(shoppingItems)
        );

        return true;
    } catch (error) {
        console.error("Unable to save shopping list:", error);

        showMessage(
            "Unable to save changes in this browser.",
            "error"
        );

        return false;
    }
}




function renderShoppingList() {
    shoppingList.innerHTML = "";

    shoppingItems.forEach(function (item, index) {
        const listItem = document.createElement("li");

        listItem.dataset.index = index;

        if (item.purchased) {
            listItem.classList.add("purchased");
        }

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = item.purchased;

        checkbox.setAttribute(
            "aria-label",
            "Mark " + item.name + " as purchased"
        );

        // Item name
        const nameSpan = document.createElement("span");

        nameSpan.className = "item-name";
        nameSpan.textContent = item.name;

        // Item price
        const priceSpan = document.createElement("span");

        priceSpan.className = "item-price";
        priceSpan.textContent = " - " + item.price.toFixed(2);

        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-button";

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        // Assemble the list item
        listItem.appendChild(checkbox);
        listItem.appendChild(nameSpan);
        listItem.appendChild(priceSpan);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        shoppingList.appendChild(listItem);
    });

    updateTotals();
}



addButton.addEventListener("click", function () {
    const name = itemInput.value.trim();
    const priceText = priceInput.value.trim();
    const price = Number(priceText);

    // Validate item name
    if (name === "") {
        showMessage("Please enter an item name.", "error");
        itemInput.focus();
        return;
    }

    // Validate price
    if (
        priceText === "" ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        showMessage("Please enter a valid, non-negative price.", "error");
        priceInput.focus();
        return;
    }

    // Add the item
    shoppingItems.push({
        name: name,
        price: price,
        purchased: false
    });

    saveItems();
    renderShoppingList();

    itemInput.value = "";
    priceInput.value = "";

    itemInput.focus();

    showMessage(name + " was added to your shopping list.");
});




shoppingList.addEventListener("change", function (event) {
    if (!event.target.classList.contains("item-checkbox")) {
        return;
    }

    const listItem = event.target.closest("li");
    const index = Number(listItem.dataset.index);

    if (!shoppingItems[index]) {
        return;
    }

    shoppingItems[index].purchased = event.target.checked;

    saveItems();
    renderShoppingList();

    if (event.target.checked) {
        showMessage(shoppingItems[index].name + " marked as purchased.");
    } else {
        showMessage(shoppingItems[index].name + " marked as not purchased.");
    }
});




shoppingList.addEventListener("click", function (event) {
    const listItem = event.target.closest("li");

    if (!listItem || !shoppingList.contains(listItem)) {
        return;
    }

    const index = Number(listItem.dataset.index);
    const item = shoppingItems[index];

    if (!item) {
        return;
    }


    // --------------------------------------
    // EDIT ITEM INLINE
    // --------------------------------------

    if (event.target.classList.contains("edit-button")) {
        // Don't create another edit form if one is already open
        if (listItem.querySelector(".edit-form")) {
            return;
        }

        listItem.innerHTML = "";

        // Keep the checkbox visible while editing
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "item-checkbox";
        checkbox.checked = item.purchased;

        checkbox.setAttribute(
            "aria-label",
            "Mark " + item.name + " as purchased"
        );

        // Create inline edit form
        const editForm = document.createElement("div");

        editForm.className = "edit-form";

        // Name field
        const nameField = document.createElement("input");

        nameField.type = "text";
        nameField.className = "edit-name";
        nameField.value = item.name;
        nameField.setAttribute("aria-label", "Item name");

        // Price field
        const priceField = document.createElement("input");

        priceField.type = "number";
        priceField.className = "edit-price";
        priceField.min = "0";
        priceField.step = "any";
        priceField.value = item.price;
        priceField.setAttribute("aria-label", "Item price");

        // Save button
        const saveButton = document.createElement("button");

        saveButton.type = "button";
        saveButton.textContent = "Save";
        saveButton.className = "save-button";

        // Cancel button
        const cancelButton = document.createElement("button");

        cancelButton.type = "button";
        cancelButton.textContent = "Cancel";
        cancelButton.className = "cancel-button";

        editForm.appendChild(nameField);
        editForm.appendChild(priceField);
        editForm.appendChild(saveButton);
        editForm.appendChild(cancelButton);

        listItem.appendChild(checkbox);
        listItem.appendChild(editForm);

        nameField.focus();
        nameField.select();

        showMessage("Edit the item name or price, then select Save.");

        return;
    }


    

    if (event.target.classList.contains("save-button")) {
        const nameField = listItem.querySelector(".edit-name");
        const priceField = listItem.querySelector(".edit-price");

        if (!nameField || !priceField) {
            return;
        }

        const newName = nameField.value.trim();
        const priceText = priceField.value.trim();
        const newPrice = Number(priceText);

        if (newName === "") {
            showMessage("The item name cannot be empty.", "error");
            nameField.focus();
            return;
        }

        if (
            priceText === "" ||
            !Number.isFinite(newPrice) ||
            newPrice < 0
        ) {
            showMessage("Please enter a valid, non-negative price.", "error");
            priceField.focus();
            return;
        }

        
        item.name = newName;
        item.price = newPrice;

        saveItems();
        renderShoppingList();

        showMessage(newName + " was updated successfully.");

        return;
    }


    

    if (event.target.classList.contains("cancel-button")) {
        renderShoppingList();

        showMessage("Editing cancelled. No changes were made.");

        return;
    }


    

    if (event.target.classList.contains("delete-button")) {
        const deletedName = item.name;

        shoppingItems.splice(index, 1);

        saveItems();
        renderShoppingList();

        showMessage(deletedName + " was removed from your list.");
    }
});




markPurchasedButton.addEventListener("click", function () {
    if (shoppingItems.length === 0) {
        showMessage("Your shopping list is empty.", "error");
        return;
    }

    shoppingItems.forEach(function (item) {
        item.purchased = true;
    });

    saveItems();
    renderShoppingList();

    showMessage("All items have been marked as purchased.");
});




clearButton.addEventListener("click", function () {
    if (shoppingItems.length === 0) {
        showMessage("Your shopping list is already empty.", "error");
        return;
    }

    shoppingItems = [];

    saveItems();
    renderShoppingList();

    showMessage("Your shopping list has been cleared.");
});



function updateTotals() {
    let fullTotal = 0;
    let purchasedTotal = 0;

    shoppingItems.forEach(function (item) {
        fullTotal += item.price;

        if (item.purchased) {
            purchasedTotal += item.price;
        }
    });

    const remainingTotal = fullTotal - purchasedTotal;

    document.getElementById("full-total").textContent =
        fullTotal.toFixed(2);

    document.getElementById("purchased-total").textContent =
        purchasedTotal.toFixed(2);

    document.getElementById("remaining-total").textContent =
        remainingTotal.toFixed(2);
}



renderShoppingList();
