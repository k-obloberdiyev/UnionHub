const { insertProfile } = require("./db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const [,, emailArg, passwordArg, nameArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error("Usage: node create-user.js <email> <password> [name]");
  process.exit(1);
}

const id = crypto.randomUUID();
const email = emailArg;
const passwordHash = bcrypt.hashSync(passwordArg, 10);
const fullName = nameArg || "Admin User";
const [firstName, ...restNames] = fullName.trim().split(/\s+/);
const lastName = restNames.length ? restNames.join(" ") : null;
const createdAt = new Date().toISOString();
const updatedAt = createdAt;

try {
  insertProfile({
    id,
    email,
    password_hash: passwordHash,
    first_name: firstName || null,
    last_name: lastName,
    department_id: null,
    avatar_url: null,
    coins: 0,
    credibility_score: 0,
    name: fullName,
    class_name: null,
    biography: "",
    department_code: null,
    created_at: createdAt,
    updated_at: updatedAt,
  });

  console.log("User created:", { id, email, name });
  process.exit(0);
} catch (e) {
  console.error("Failed to create user:", e.message);
  process.exit(1);
}
