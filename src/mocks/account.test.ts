import { test } from "node:test";
import assert from "node:assert/strict";
import { AccountOrders, AddressInput, MAX_ADDRESSES, SavedAddress } from "../contracts/account.ts";
import { Order } from "../contracts/orders.ts";
import { addMockAddress, mockAccountOrders, removeMockAddress } from "./account.ts";
import { getMockOrder } from "./orders.ts";

const home = AddressInput.parse({ name: "Demo Customer", line1: "1 Rue Exemple", city: "Paris", postalCode: "75001", country: "FR" });

test("account orders match the contract and open on the order page", () => {
  const orders = AccountOrders.parse(mockAccountOrders("demo@example.com"));
  assert.deepEqual(orders.items.map((o) => [o.number, o.status, o.itemCount]), [
    ["VY-000117", "SHIPPED", 2],
    ["VY-000101", "DELIVERED", 1],
  ]);
  const first = Order.parse(getMockOrder(orders.items[0].number, orders.items[0].token));
  assert.equal(first.total.amount, orders.items[0].total.amount);
});

test("address book: add up to the limit, then refuse; remove by id", () => {
  let list: SavedAddress[] = [];
  for (let i = 0; i < MAX_ADDRESSES; i++) list = addMockAddress(list, home, `a${i}`)!;
  assert.equal(list.length, MAX_ADDRESSES);
  assert.equal(addMockAddress(list, home, "extra"), null);
  assert.deepEqual(removeMockAddress(list, "a0").map((a) => a.id), ["a1", "a2", "a3", "a4"]);
});

test("address input is validated like checkout", () => {
  assert.throws(() => AddressInput.parse({ ...home, country: "US" }));
  assert.throws(() => AddressInput.parse({ ...home, name: " " }));
  assert.throws(() => AddressInput.parse({ ...home, phone: "abc" }));
});
