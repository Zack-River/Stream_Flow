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

connectDB();

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/debug-files", (req, res) => {
  const readmePath = path.join(__dirname, "readme.md");
  const indexPath = path.join(__dirname, "public", "doc.html");
  const exists = {
    readme: fs.existsSync(readmePath),
    docHtml: fs.existsSync(indexPath),
  };
  res.json(exists);
});


app.get("/doc", (req, res) => {
  try {
    const readmePath = path.join(__dirname, "readme.md");
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
    });
  }
});

// Static middlewares AFTER custom routes
app.use('/static', express.static(path.join(__dirname, "public")));  // Serve at /static/*
app.use(express.static(path.join(__dirname, "..", "client")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "StreamFlow API Documentation",
  })
);

app.use(adminRoutes);
app.use(adminAudioRoutes);
app.use(userRoutes);
app.use("/audios", audioRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Something went wrong!",
  });
});

module.exports = app;