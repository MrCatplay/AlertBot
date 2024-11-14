async function inventory_search(bot, inventory) {
    const slots = {}
    slots.emptySlotIndex = inventory.slice(0, 26).findIndex(itemStack => itemStack === null);

    inventory.forEach((itemStack, index) => {
        if (!itemStack?.nbt?.value?.Enchantments) return;

        const enchantments = itemStack.nbt.value.Enchantments.value.value;
        if (!Array.isArray(enchantments)) return;

        const enchantString = enchantments.map(enchantment =>
            `${enchantment.id.value} ${enchantment.lvl.value}`
        ).join(", ");

        if (enchantString.includes('minecraft:mob-farmer-enchant') || enchantString.includes('minecraft:looting 5')) {
            if (index >= 27) {
                slots.sword = index
            }
        } else if (index <= 26) {
            slots.updatesword = index
        }
    });

    return slots
}

async function ec_search(bot, inventory) {
    const slots = {}
    slots.emptySlotIndex = inventory.slice(0, 26).findIndex(itemStack => itemStack === null);

    inventory.forEach((itemStack, index) => {
        if (!itemStack?.nbt?.value?.Enchantments) return;

        const enchantments = itemStack.nbt.value.Enchantments.value.value;
        if (!Array.isArray(enchantments)) return;

        const enchantString = enchantments.map(enchantment =>
            `${enchantment.id.value} ${enchantment.lvl.value}`
        ).join(", ");

        if (enchantString.includes('minecraft:mob-farmer-enchant') || enchantString.includes('minecraft:looting 5')) {
            if (index <= 26) {
                slots.sword = index
            }
        } else if (index >= 27) {
            slots.updatesword = index
        }
    });

    // console.log(slots)
    return slots
}

module.exports = { inventory_search, ec_search }