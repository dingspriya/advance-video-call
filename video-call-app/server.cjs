require("dotenv").config();
console.log("Mongo URI loaded:", Boolean(process.env.MONGODB_URI));

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);
let users;
let rooms;
let calls;
let contacts;
let roomParticipants;

async function startServer() {
  await client.connect();

  const db = client.db("video-call-page");
  users = db.collection("users");
  rooms = db.collection("rooms");
  calls = db.collection("calls");
  contacts = db.collection("contacts");
  roomParticipants = db.collection("roomParticipants");

  await users.createIndex({ email: 1 }, { unique: true });

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

// POST /api/signup — create an account
app.post("/api/signup", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters.",
      });
    }

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await users.insertOne({
      email,
      passwordHash,
      name: email.split("@")[0],
      createdAt: new Date(),
    });

    return res.status(201).json({
      user: {
        id: result.insertedId.toString(),
        name: email.split("@")[0],
        email,
      },
    });
  } catch (error) {
    console.error("Signup failed:", error);
    return res.status(500).json({ error: "Could not create account." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const account = await users.findOne({ email });

    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }

    return res.json({
      user: {
        id: account._id.toString(),
        name: account.name,
        email: account.email,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Could not log in." });
  }
});

// POST /api/rooms — create a meeting room
app.post("/api/rooms", async (req, res) => {
  try {
    const { name, creatorId } = req.body;

    if (!name || !ObjectId.isValid(creatorId)) {
      return res
        .status(400)
        .json({ error: "A room name and valid creator ID are required." });
    }

    const result = await rooms.insertOne({
      name: name.trim(),
      createdBy: new ObjectId(creatorId),
      participantIds: [new ObjectId(creatorId)],
      status: "active",
      createdAt: new Date(),
    });

    res.status(201).json({ roomId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create room." });
  }
});

// POST /api/contacts — save a contact relationship
app.get("/api/contacts", async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: "A valid owner ID is required." });
    }

    const saved = await contacts
      .aggregate([
        { $match: { ownerId: new ObjectId(ownerId) } },
        {
          $lookup: {
            from: "users",
            localField: "contactUserId",
            foreignField: "_id",
            as: "person",
          },
        },
        { $unwind: "$person" },
        {
          $project: {
            _id: 0,
            id: { $toString: "$person._id" },
            name: "$person.name",
            email: "$person.email",
          },
        },
      ])
      .toArray();

    res.json({ contacts: saved });
  } catch (error) {
    console.error("Load contacts failed:", error);
    res.status(500).json({ error: "Could not load contacts." });
  }
});

// POST /api/calls — save a call record after a call starts
app.post("/api/calls", async (req, res) => {
  try {
    const { roomId, participantIds } = req.body;

    if (
      !ObjectId.isValid(roomId) ||
      !Array.isArray(participantIds) ||
      participantIds.some((id) => !ObjectId.isValid(id))
    ) {
      return res.status(400).json({
        error: "Provide a valid room ID and an array of valid participant IDs.",
      });
    }

    const result = await calls.insertOne({
      roomId: new ObjectId(roomId),
      participantIds: participantIds.map((id) => new ObjectId(id)),
      startedAt: new Date(),
      endedAt: null,
    });

    res.status(201).json({ callId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not save contact." });
  }
});

// Search registered app users by name or email
app.get("/api/users", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    if (!search) {
      return res.json({ users: [] });
    }

    const foundUsers = await users
      .find(
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
        { projection: { name: 1, email: 1 } },
      )
      .limit(20)
      .toArray();

    res.json({
      users: foundUsers.map((person) => ({
        id: person._id.toString(),
        name: person.name,
        email: person.email,
      })),
    });
  } catch (error) {
    console.error("User search failed:", error);
    res.status(500).json({ error: "Could not search users." });
  }
});

app.post("/api/rooms/:roomId/participants", async (req, res) => {
  try {
    const { participant } = req.body;
    if (!participant?.id) {
      return res.status(400).json({ error: "Participant id is required" });
    }

    await roomParticipants.updateOne(
      { roomId: req.params.roomId, id: participant.id },
      {
        $set: {
          ...participant,
          roomId: req.params.roomId,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not join room" });
  }
});

app.get("/api/rooms/:roomId/participants", async (req, res) => {
  try {
    const participants = await roomParticipants
      .find({ roomId: req.params.roomId })
      .project({ _id: 0, roomId: 0, updatedAt: 0 })
      .toArray();

    res.json({ participants });
  } catch (error) {
    console.error("Load participants failed:", error);
    res.status(500).json({ error: "Could not load participants" });
  }
});

app.patch("/api/rooms/:roomId/participants/:userId", async (req, res) => {
  try {
    await roomParticipants.updateOne(
        { roomId: req.params.roomId, id: req.params.userId },
        { $set: { micOn: req.body.micOn, cameraOn: req.body.cameraOn } },
      );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update participant" });
  }
});

app.delete("/api/rooms/:roomId/participants/:userId", async (req, res) => {
  try {
   await roomParticipants.deleteOne({
      roomId: req.params.roomId,
      id: req.params.userId,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not remove participant" });
  }
});

startServer().catch((error) => {
  console.error("Could not start server:", error);
  process.exit(1);
});
