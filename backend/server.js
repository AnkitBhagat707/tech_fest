const express = require("express");
const connectDB = require('./config/database.js');
const path = require("path");
const session = require("express-session");

const PORT = process.env.PORT || 8000;
const app = express();

// MODELS
const Notice = require("./models/notic");
const Admin = require("./models/admin");
const upload = require("./middleware/multer");
const Student = require("./models/student_regrestration");

// DATABASE
connectDB();

// ===================
// MIDDLEWARE
// ===================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ STATIC FILES (FIXED)
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ✅ SESSION
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: false
}));

// ===================
// VIEW ENGINE (FIXED)
// ===================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// ===================
// AUTH MIDDLEWARE
// ===================
const isAdminLoggedIn = (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect("/admin/login");
  }
  next();
};

// ===================
// PUBLIC ROUTES
// ===================
app.get("/", (req, res) => {
  res.render("firstpage");
});

app.get("/Home/event", (req, res) => {
  res.render("event");
});

app.get("/Home/gallary", (req, res) => {
  res.render("gallary");
});

app.get("/Home/noticboard", async (req, res) => {
  const notices = await Notice.find().sort({ _id: -1 });
  res.render("noticboard", { notices });
});

// ===================
// ADMIN AUTH SYSTEM
// ===================
app.get("/admin", async (req, res) => {
  const admin = await Admin.findOne();
  if (!admin) return res.redirect("/admin/register");
  res.redirect("/admin/login");
});

app.get("/admin/register", async (req, res) => {
  try {
    const admin = await Admin.findOne();
    if (admin) return res.redirect("/admin/login");
    res.render("register");
  } catch (err) {
    console.error(err);
    res.send("Error loading register page ❌");
  }
});

app.post("/admin/register", async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) return res.send("Registration closed");

    const { name, email, password } = req.body;

    const newAdmin = new Admin({
      name,
      email,
      password
    });

    await newAdmin.save();
    res.redirect("/admin/login");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Server error ❌");
  }
});

app.get("/admin/login", (req, res) => {
  res.render("login");
});

app.post("/admin/login", async (req, res) => {
  try {
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    const admin = await Admin.findOne({ email });

    if (!admin) return res.send("Admin not found");
    if (password !== admin.password) return res.send("Wrong password");

    req.session.adminId = admin._id;
    res.redirect("/admin_panel");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error ❌");
  }
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

// ===================
// ADMIN PANEL
// ===================
app.get("/admin_panel", async (req, res) => {
  try {
    if (!req.session.adminId) {
      return res.redirect("/admin/login");
    }

    const totalNotices = await Notice.countDocuments();
    const totalStudents = await Student.countDocuments();

    res.render("admin_panel", {
      totalNotices,
      totalStudents
    });
  } catch (err) {
    console.error("Admin panel error:", err);
    res.status(500).send("Server error ❌");
  }
});

app.get("/admin_panel/notice", isAdminLoggedIn, (req, res) => {
  res.render("admin_panel_notice");
});

app.post("/admin_panel/notice", isAdminLoggedIn, upload.single("photo"), async (req, res) => {
  const newNotice = new Notice({
    title: req.body.title,
    image: req.file.filename
  });

  await newNotice.save();
  res.redirect("/admin_panel/notice");
});

app.get("/manage_notice", isAdminLoggedIn, async (req, res) => {
  const notices = await Notice.find().sort({ _id: -1 });
  res.render("mangae_notic", { notices });
});

app.post("/admin_panel/notice/delete/:id", isAdminLoggedIn, async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.redirect("/manage_notice");
});

app.get("/admin_panel/notice/edit/:id", isAdminLoggedIn, async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  res.render("edit_notice", { notice });
});

app.post("/admin_panel/notice/edit/:id", isAdminLoggedIn, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  let updateData = { title };

  if (req.file) {
    updateData.image = req.file.filename;
  }

  await Notice.findByIdAndUpdate(id, updateData);
  res.redirect("/manage_notice");
});

// ===================
// STUDENT REGISTRATION
// ===================
app.get("/student", (req, res) => {
  res.render("student_register");
});

app.post("/register", async (req, res) => {
  try {
    let { name, email, rollno, phone, activity } = req.body;

    if (!name || !email || !rollno || !phone) {
      return res.send("All fields are required ❌");
    }

    if (!activity) activity = [];
    if (!Array.isArray(activity)) activity = [activity];

    let existing = await Student.findOne({ email: email.toLowerCase() });

    if (existing) {
      const newActivities = activity.filter(a => !existing.activity.includes(a));
      if (newActivities.length === 0) return res.send("Already registered ❌");

      existing.activity.push(...newActivities);
      existing.name = name;
      existing.rollno = rollno;
      existing.phone = phone;

      await existing.save();
      return res.send("Updated successfully ✅");
    }

    const student = new Student({
      name,
      email: email.toLowerCase(),
      rollno,
      phone,
      activity
    });

    await student.save();
    res.send("Registration successful ✅");
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).send("Server error ❌");
  }
});

// ===================
// ERROR HANDLER
// ===================
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

// ===================
// SERVER START
// ===================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});