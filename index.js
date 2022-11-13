const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ extended: false }));
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
app.use('/', require('./routes/opniaoRoutes'));