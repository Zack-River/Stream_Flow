// ============================
// server/index.js (or server/app.js)
// ============================

const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const { marked } = require("marked");
const fs = require("fs");

// Routes
const adminRoutes = require("./routes/admin.Routes.js");
const userRoutes = require("./routes/user.Routes.js");
const audioRoutes = require("./routes/audio.Routes.js");
const adminAudioRoutes = require("./routes/admin.audio.Routes.js");

// Connect to database
connectDB();

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static assets first
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));

// Documentation markdown route
app.get("/", (req, res) => {
  try {
    const readmePath = path.join(__dirname, "README.md");
    const indexPath = path.join(__dirname, "public", "doc.html");

    const readmeContent = fs.readFileSync(readmePath, "utf8");
    const htmlContent = marked(readmeContent);
    const template = fs.readFileSync(indexPath, "utf8");

    const finalHtml = template.replace("{{CONTENT}}", htmlContent);
    res.send(finalHtml);
  } catch (error) {
    console.error("Error serving documentation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load documentation",
      details: error.message,
    });
  }
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "StreamFlow API Documentation",
}));

// Routes
app.use(adminRoutes);
app.use(adminAudioRoutes);
app.use(userRoutes);
app.use("/audios", audioRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong!" });
});

module.exports = app;