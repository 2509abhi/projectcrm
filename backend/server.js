const startConsumer = require("./startcosumers");
require("dotenv").config({ path: "./.env" });
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const Customer = require("./MongoFiles/coustomer");
const customerRoutes = require("./paths/coustmer");
const orderRoutes = require("./paths/order");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;
const DOMAIN = process.env.DOMAIN || `http://localhost:${PORT}`;
const path = require("path");

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected");
    startConsumer(); // Start the consumer after connecting to MongoDB
  })
  .catch((err) => console.log(err));

app.use(bodyParser.json());
app.use(cors({ origin: DOMAIN, credentials: true }));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Define User Schema and Model
const UserSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
});

const User = mongoose.model("User", UserSchema);

const CommunicationLogSchema = new mongoose.Schema({
  campaignId: String,
  customerId: mongoose.Schema.Types.ObjectId,
  message: String,
  status: String,
});

const CommunicationLog = mongoose.model(
  "CommunicationLog",
  CommunicationLogSchema
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${DOMAIN}/auth/google/callback`,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
        });
        await newUser.save();
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${DOMAIN}/login` }),
  (req, res) => {
    res.redirect(`${DOMAIN}/dashboard`);
  }
);

app.get("/api/current_user", (req, res) => {
  res.send(req.user);
});

app.get("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect(`${DOMAIN}/`);
  });
});


app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);

const CampaignSchema = new mongoose.Schema({
  audienceSize: Number,
  sent: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  status: String,
  createdAt: { type: Date, default: Date.now }, // Add this line
});

const Campaign = mongoose.model("Campaign", CampaignSchema);

app.post("/api/check-audience", async (req, res) => {
  const rules = req.body.rules;
  console.log("Received rules:", rules);

  let conditions = [];

  rules.forEach((rule) => {
    const { field, operator, value } = rule;
    let conditionObject = {};

    let fieldValue = value;
    if (field === "last_visit") {
      fieldValue = new Date(value);
    } else {
      fieldValue = parseFloat(value);
    }

    if (operator === ">") {
      conditionObject[field] = { $gt: fieldValue };
    } else if (operator === ">=") {
      conditionObject[field] = { $gte: fieldValue };
    } else if (operator === "<") {
      conditionObject[field] = { $lt: fieldValue };
    } else if (operator === "<=") {
      conditionObject[field] = { $lte: fieldValue };
    } else if (operator === "==") {
      conditionObject[field] = fieldValue;
    }

    conditions.push(conditionObject);
  });

  let query = { $and: conditions };

  try {
    console.log("Query:", JSON.stringify(query));
    const audience = await Customer.find(query);
    console.log("Audience:", audience);
    res.json({ audienceSize: audience.length });
  } catch (error) {
    console.error("Error checking audience:", error);
    res.status(500).json({ error: "Error checking audience" });
  }
});

app.post("/api/save-audience", async (req, res) => {
  const rules = req.body.rules;
  console.log("Received rules:", rules);

  let conditions = [];

  rules.forEach((rule) => {
    const { field, operator, value } = rule;
    let conditionObject = {};

    let fieldValue = value;
    if (field === "last_visit") {
      fieldValue = new Date(value);
    } else {
      fieldValue = parseFloat(value);
    }

    if (operator === ">") {
      conditionObject[field] = { $gt: fieldValue };
    } else if (operator === ">=") {
      conditionObject[field] = { $gte: fieldValue };
    } else if (operator === "<") {
      conditionObject[field] = { $lt: fieldValue };
    } else if (operator === "<=") {
      conditionObject[field] = { $lte: fieldValue };
    } else if (operator === "==") {
      conditionObject[field] = fieldValue;
    }

    conditions.push(conditionObject);
  });

  let query = { $and: conditions };

  try {
    console.log("Query:", JSON.stringify(query));
    const audience = await Customer.find(query);
    console.log("Audience:", audience);

    let communicationLogs = [];
    const campaignId = uuidv4(); // Unique identifier for the campaign

    audience.forEach((customer) => {
      const message = `Hi ${customer.name}, here is 10% off on your next order`;
      communicationLogs.push({
        campaignId, // Include campaignId
        customerId: customer._id,
        message,
        status: "PENDING",
      });
    });

    const savedLogs = await CommunicationLog.insertMany(communicationLogs);
    console.log("Saved communication logs:", savedLogs);

    // Simulate sending messages in bulk and hitting Delivery Receipt API
    savedLogs.forEach((log) => {
      setTimeout(() => {
        const deliveryStatus = Math.random() < 0.9 ? "SENT" : "FAILED";
        console.log(
          `Sending delivery receipt for log ${log._id} with status ${deliveryStatus}`
        );
        axios
          .post(`${DOMAIN}/api/delivery-receipt`, {
            id: log._id,
            status: deliveryStatus,
          })
          .then((response) => {
            console.log(
              `Delivery receipt updated for log ${log._id}:`,
              response.data
            );
          })
          .catch((error) => {
            console.error(
              `Error updating delivery receipt for log ${log._id}:`,
              error
            );
          });
      }, Math.random() * 1000); // Simulate network delay
    });

    res.json({ status: "Audience saved and messages sent to queue" });
  } catch (error) {
    console.error("Error saving audience:", error);
    res.status(500).json({ error: "Error saving audience" });
  }
});

app.get("/api/campaigns", async (req, res) => {
  try {
    const campaigns = await CommunicationLog.aggregate([
      {
        $group: {
          _id: "$campaignId",
          audienceSize: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
          createdAt: { $first: "$createdAt" }, // Add this line to get the createdAt field
        },
      },
      {
        $project: {
          _id: 0,
          campaignId: "$_id",
          audienceSize: 1,
          sent: 1,
          failed: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 } // Sort by createdAt in descending order
      },
    ]);

    console.log("Campaigns:", campaigns);
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Error fetching campaigns" });
  }
});


app.post("/api/delivery-receipt", async (req, res) => {
  const { id, status } = req.body;

  try {
    console.log(
      `Updating delivery receipt for log ${id} with status ${status}`
    );
    const result = await CommunicationLog.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!result) {
      console.log(`Log entry with id ${id} not found`);
    } else {
      console.log(`Updated log entry:`, result);
    }
    res.json({ status: "Updated" });
  } catch (error) {
    console.error("Error updating delivery receipt:", error);
    res.status(500).json({ error: "Error updating delivery receipt" });
  }
});

// Serve the React frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});