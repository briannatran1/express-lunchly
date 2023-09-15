"use strict";

/** Routes for Lunchly */

const express = require("express");

const { BadRequestError, NotFoundError } = require("./expressError");
const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers.
 *  Searching for a customer will return searched customer */

router.get("/", async function (req, res, next) {
  const searched = req.query.search;
//TODO: notcase insensitive, wont scale well <- SQL query, should be in model
  if (searched) {
    const allCustomers = await Customer
      .all();
    const matchedCustomers = allCustomers
      .filter(customer => customer.firstName.startsWith(searched));

    return res.render("customer_searched_list.html", { matchedCustomers });
  }
  else {
    const customers = await Customer.all();
    return res.render("customer_list.html", { customers });
  }
});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.html");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Display top ten customers */

router.get("/top-ten", async function (req, res) {
  const topTen = await Customer.topTen();
  // const ten = topTen.map(customer => customer.fullName() )
  return res.render("customer_top_ten.html", { topTen });
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.html", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.html", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  //TODO: if body data is invalid
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});

module.exports = router;
