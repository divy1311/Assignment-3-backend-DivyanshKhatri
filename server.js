const express = require("express");
var cors = require("cors");
const axios = require("axios");
const app = express();
app.use(cors())
app.options('*', cors())
const port = process.env.PORT || 3000;

const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://khatrid:T5U22ZIrfkbJZtXU@web-tech.ewmd5v9.mongodb.net/?retryWrites=true&w=majority&appName=web-tech";
const client = new MongoClient(uri);

client
  .connect()
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

require("dotenv").config();

const finnhubToken = process.env.FINNHUB_API_KEY;
const polygonToken = process.env.POLYGON_API_KEY;

app.get("/company", (req, res) => {
  const ticker = req.query.ticker;
  const url =
    "https://finnhub.io/api/v1/stock/profile2?symbol=" +
    ticker +
    "&token=" +
    finnhubToken;

  axios.get(url).then((response) => {
    if (Object.keys(response.data).length === 0) {
      console.log("Company not found");
      return res.status(404).json({ error: "Company not found", code: "404" });
    } else if (response.status === 401) {
      console.log("Unauthorized");
      return res.status(401).json({ error: "Unauthorized", code: "401" });
    }
    return res.json(response.data);
  });
});

app.get("/company/quote", (req, res) => {
  const ticker = req.query.ticker;
  const url =
    "https://finnhub.io/api/v1/quote?symbol=" +
    ticker +
    "&token=" +
    finnhubToken;

  axios.get(url).then((response) => {
    if (response.data.d === null) {
      console.log("Company not found");
      return res.status(404).json({ error: "Company not found", code: "404" });
    } else if (response.status === 401) {
      console.log("Unauthorized");
      return res.status(401).json({ error: "Unauthorized", code: "401" });
    }
    return res.json(response.data);
  });
});

// counter = 1

// app.get("/company/quote", (req, res) => {
//   const ticker = req.query.ticker;
//   const url =
//     "https://finnhub.io/api/v1/quote?symbol=" +
//     ticker +
//     "&token=" +
//     finnhubToken;

//   axios.get(url).then((response) => {
//     if (response.data.d === null) {
//       console.log("Company not found");
//       return res.status(404).json({ error: "Company not found", code: "404" });
//     } else if (response.status === 401) {
//       console.log("Unauthorized");
//       return res.status(401).json({ error: "Unauthorized", code: "401" });
//     }

//     // Check if response.data.c exists and is a number
//     if (response.data.c && typeof response.data.c === 'number') {
//       response.data.c += counter;
//       counter++;
//     }

//     return res.json(response.data);
//   });
// });

// // TODO: count, result, description, displaySymbol, symbol, type

app.get("/company/names", (req, res) => {
  const ticker = req.query.ticker;
  const url =
    "https://finnhub.io/api/v1/search?q=" + ticker + "&token=" + finnhubToken;

  axios.get(url).then((response) => {
    const filteredResults = response.data.result.filter(item =>
      item.type === "Common Stock" && !item.displaySymbol.includes(".")
    );
    return res.json(filteredResults);
  });
});

app.get("/company/news", (req, res) => {
  const ticker = req.query.ticker;
  const todayDate = new Date().toISOString().split("T")[0];
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const oldDate = date.toISOString().split("T")[0];
  const url =
    "https://finnhub.io/api/v1/company-news?symbol=" +
    ticker +
    "&from=" +
    oldDate +
    "&to=" +
    todayDate +
    "&token=" +
    finnhubToken;

  axios.get(url).then((response) => {
    if (response.data.length === 0) {
      return res.status(404).json({ error: "Company not found", code: "404" });
    }
    response.data = response.data.filter(n =>
      n.summary &&
      n.summary.trim() !== '' &&
      n.headline &&
      n.headline.trim() !== '' &&
      n.image &&
      n.image.trim() !== '' &&
      n.url &&
      n.url.trim() !== '' &&
      n.source &&
      n.source.trim() !== '' &&
      n.datetime !== null
    );
    return res.json(response.data);
  });
});

app.get("/company/trends", (req, res) => {
  const ticker = req.query.ticker;
  const url =
    "https://finnhub.io/api/v1/stock/recommendation?symbol=" +
    ticker +
    "&token=" +
    finnhubToken;

  axios.get(url).then((response) => {
    if (response.data.length === 0) {
      return res.status(404).json({ error: "Company not found", code: "404" });
    }
    return res.json(response.data);
  });
});

app.get("/company/sentiments", (req, res) => {
  const ticker = req.query.ticker;
  const url =
    "https://finnhub.io/api/v1/stock/insider-sentiment?symbol=" +
    ticker +
    "&from=2022-01-01&token=" +
    finnhubToken;

  axios.get(url).then((response) => {
    if (response.data.data.length === 0) {
      return res.status(404).json({ error: "Company not found", code: "404" });
    }
    return res.json(response.data.data);
  });
});

app.get("/company/peers", (req, res) => {
  const ticker = req.query.ticker;
  const url =
    "https://finnhub.io/api/v1/stock/peers?symbol=" +
    ticker +
    "&token=" +
    finnhubToken;

  axios.get(url).then((response) => {
    if (response.status === 401)
      return res.status(401).json({ error: "Unauthorized", code: "401" });
    return res.json(response.data);
  });
});

//TODO: null to 0

app.get("/company/earnings", (req, res) => {
  const ticker = req.query.ticker;
  const url =
    "https://finnhub.io/api/v1/stock/earnings?symbol=" +
    ticker +
    "&token=" +
    finnhubToken;

  axios.get(url).then((response) => {
    if (response.status === 401)
      return res.status(401).json({ error: "Unauthorized", code: "401" });
    return res.json(response.data);
  });
});

app.get("/chartData", (req, res) => {
  const ticker = req.query.ticker;
  const singleDay = req.query.singleDay;
  const date = new Date();
  let url = "";
  console.log(singleDay);
  let normalDates = false;
  if (singleDay === "true") {
    let oldDate;
    let todayDate;
    console.log("singleDay");
    console.log("day = " + date.getDay());
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      console.log("normalDates");
      normalDates = true;
    }
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() - 1);
    }
    oldDate = getDateInFormat(date);
    var today = new Date();
    today.setDate(date.getDate() + 1);
    todayDate = getDateInFormat(today);
    if (normalDates) {
      var today = new Date();
      todayDate = getDateInFormat(today);

      var yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      oldDate = getDateInFormat(yesterday);
    }
    url =
      "https://api.polygon.io/v2/aggs/ticker/" +
      ticker +
      "/range/1/hour/" +
      oldDate +
      "/" +
      todayDate +
      "?adjusted=true&sort=asc&apiKey=" +
      polygonToken;
  } else {
    date.setFullYear(date.getFullYear() - 2);
    const oldDate = date.toISOString().split("T")[0];
    const todayDate = new Date().toISOString().split("T")[0];
    url =
      "https://api.polygon.io/v2/aggs/ticker/" +
      ticker +
      "/range/1/day/" +
      oldDate +
      "/" +
      todayDate +
      "?adjusted=true&sort=asc&apiKey=" +
      polygonToken;
  }
  console.log(url);
  axios.get(url).then((response) => {
    if(response.data.queryCount === 0) {
      return res.status(404).json({ error: "Company not found", code: "404" });
    } else if (response.data.status === 'ERROR') {
      return res.status(401).json({ error: "TOO MANY REQUESTS", code: "600" });
    }
    return res.json(response.data);
  }).catch((error) => {
    console.error(error);
    return res.status(500).json({ error: error.message });
  });
});

app.get("/getWallet", async (req, res) => {
  let docs;

  try {
    const db = client.db("wallet");
    const collection = db.collection("assignment-3");

    docs = await collection.find({}).toArray();
    if (docs.length === 0) {
      console.log("No documents found");
    } else {
      console.log(docs);
    }
  } catch (err) {
    console.error("Error:", err);
  }

  return res.json(docs ? docs[0].amount : -1);
});

app.get("/updateWallet", async (req, res) => {
  let docs;

  try {
    const db = client.db("wallet");
    const collection = db.collection("assignment-3");

    const amount = parseFloat(req.query.amount);
    if (isNaN(amount)) {
      return res.status(400).json({ error: "Amount must be an integer" });
    }

    const data = {
      amount: amount,
    };

    docs = await collection.updateOne({}, { $set: data }, { upsert: true });
    if (docs.length === 0) {
      console.log("No documents found");
    } else {
      console.log(docs);
    }
  } catch (err) {
    console.error("Error:", err);
  }

  return res.json(docs ? docs[0] : {});
});

app.get("/bought", async (req, res) => {
  try {
    const db = client.db("wallet");
    const collection = db.collection("stock");
    const stocks = await collection.find({}).toArray();
    if (stocks.length === 0) {
      console.log("No stocks found");
      return res.status(200).json([]);
    }
    return res.json(stocks);
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", code: "500" });
  }
});

app.get("/checkStock", async (req, res) => {
  const ticker = req.query.ticker;
  const stockDescription = req.query.stockDescription;
  console.log(ticker);
  try {
    const db = client.db("wallet");
    const collection = db.collection("stock");

    const stock = await collection.findOne({ stock: ticker });

    if (!stock) {
      console.log("No stock found with the given ticker");
      // Return a dummy stock object
      return res.json({
        stock: ticker,
        quantity: 0,
        price: 0,
        stockDescription: stockDescription,
      });
    }

    return res.json(stock);
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", code: "500" });
  }
});

app.get("/updateStock", async (req, res) => {
  const stockName = req.query.ticker;
  const newQuantity = parseInt(req.query.quantity, 10);
  const price = parseFloat(req.query.price);
  const stockDescription = req.query.stockDescription;
  console.log(price);
  if (isNaN(newQuantity)) {
    return res.status(400).json({ error: "Invalid quantity", code: "400" });
  }

  try {
    const db = client.db("wallet");
    const collection = db.collection("stock");

    if (newQuantity === 0) {
      const result = await collection.deleteOne({ stock: stockName });
      if (result.deletedCount > 0) {
        console.log("Stock deleted successfully");
        return res.json({ message: "Stock deleted successfully" });
      } else {
        console.log("No stock found to delete");
        return res.json({ message: "No stock found to delete" });
      }
    } else {
      const result = await collection.updateOne(
        { stock: stockName },
        {
          $set: {
            stock: stockName,
            quantity: newQuantity,
            price: price,
            stockDescription: stockDescription,
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        console.log("New stock added");
        return res.json({ message: "New stock added" });
      } else if (result.modifiedCount > 0) {
        console.log("Stock updated successfully");
        return res.json({ message: "Stock updated successfully" });
      } else {
        console.log("No changes made to the stock");
        return res.json({ message: "No changes made to the stock" });
      }
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", code: "500" });
  }
});

app.get("/addToWatchlist", async (req, res) => {
  const { ticker, stockDescription } = req.query;

  if (!ticker || !stockDescription) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    const db = client.db("wallet");

    const result = await db
      .collection("watchlist")
      .insertOne({ ticker, stockDescription });

    console.log(result);

    if (result.insertedId) {
      res.json({ message: "Stock added to watchlist" });
    } else {
      res.status(500).json({ error: "Failed to add stock to watchlist" });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getWatchlist", async (req, res) => {
  try {
    const db = client.db("wallet");
    const watchlist = await db.collection("watchlist").find({}).toArray();

    res.json(watchlist);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/removeFromWatchlist", async (req, res) => {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    const db = client.db("wallet");
    const result = await db.collection("watchlist").deleteOne({ ticker });

    if (result.deletedCount > 0) {
      res.json({ message: "Stock removed from watchlist" });
    } else {
      res.status(404).json({ error: "Stock not found in watchlist" });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

getDateInFormat = (date) => {
  var dd = String(date.getDate()).padStart(2, "0");
  var mm = String(date.getMonth() + 1).padStart(2, "0");
  var yyyy = date.getFullYear();
  return yyyy + "-" + mm + "-" + dd;
};
process.on("SIGINT", async () => {
  await client.close();
  process.exit();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
