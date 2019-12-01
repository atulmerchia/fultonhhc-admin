console.log('Starting production server');

const PORT = process.env.PORT || 5000;
const express = require('express');
const app = express();

app.use(express.static('build'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
