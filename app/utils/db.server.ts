import { PrismaClient } from "@prisma/client";
import SQLite3 from "better-sqlite3";
import { OrganizationModel } from "~/models/Organization/Organization";
import { UserModel } from "~/models/User/User";
// import { v4 as uuidv4 } from "uuid";

let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
  db.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  db = global.__db;
}

export { db };

export class Database {
  db;
  user;
  organization;
  //static #instance: Database;
  constructor() {
    // make Database class into singleton
    // if (Database.#instance) {
    //   return Database.#instance;
    // }
    // Database.#instance = this;

    this.db = new SQLite3("db.sqlite3");
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    this.user = new UserModel(this.db);
    this.organization = new OrganizationModel(this.db);
  }
}
