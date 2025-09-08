import app from "./index.js";

const PORT = process.env.PORT || 5000;
app.get("/ping", (req, res) => res.json({ success: true, message: "pong" }));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
