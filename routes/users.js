"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});



/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, movilists }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** POST /[username]/[moviename]/[id]  { state } => { movielist }
 *
 * Returns {"added": {movie_id, movie_name}}
 *
 * Authorization required: admin or same-user-as-:username
 * */

 router.post("/:username/:moviename/:id/add", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const movie_id = req.params.id;
    const movie_name = req.params.moviename;
    await User.addToList(req.params.username, movie_name, movie_id);
    return res.json({ added: {movie_id, movie_name}});
  } catch (err) {
    return next(err);
  }
});

/** POST /[username]/[moviename]/[id]  { state } => { movielist }
 *
 * Returns {"removed": {movie_id}}
 *
 * Authorization required: admin or same-user-as-:username
 * */

 router.post("/:username/:movie_name/:id/remove", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const movie_id = req.params.id;
    const movie_name = req.params.moviename;
    await User.removeFromList(req.params.username, movie_id);
    return res.json({ removed: {movie_id}});
  } catch (err) {
    return next(err);
  }
});


module.exports = router;