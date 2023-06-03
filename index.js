const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const cors = require("cors");
const cron = require("node-cron");

const fs = require("fs");
const path = require("path");
const pizZip = require("pizzip");
const docxtemplater = require("docxtemplater");
const dfd = require("danfojs-node");

const unitModel = require("./model/unit_model");

const PORT = process.env.PORT || 8000;

///Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

///Connect to DB
const mongoose = require("mongoose");
const e = require("express");
const DB = mongoose
  .connect(
    "mongodb+srv://otishkb:otishkb@hkb.ufaln9r.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database is running");

    //updateData();

    app.post("/addNewUnit", async (req, res) => {
      try {
        let unit = unitModel(req.body);
        let uploadedData = await unit.save();
        res.status(200).send(uploadedData);
        console.log(uploadedData);
        console.log("Upload success");
      } catch (e) {
        console.log(e);
      }
    });

    app.get("/fetchAllUnits", async (req, res) => {
      try {
        let data = await unitModel.find();
        res.status(200).json(data);
      } catch (e) {
        console.log(e);
      }
    });

    app.get("/fetchUnitDetail", async (req, res) => {
      try {
        let query = await req.query;
        let data = await unitModel.findOne(query);
        res.status(200).json(data);
      } catch (e) {
        res.status(404).send(e);
      }
    });

  })
  .catch((e) => {
    console.log(e);
  });

  cron.schedule("*/20 * * * * *", ()=>{
    http.get('https://otishkb.onrender.com/test', (res) =>{
      console.log('pinged');
    })
  })

///Downloading the template
app.get("/downloadTemplate", async (req, res) => {
  const templateFile =
    "C:/Users/theol/StudioProjects/hkb_database/server/file/template/template.xlsx";
  console.log(templateFile);
  res.download(templateFile);
});

app.get("/test", async (req, res) => {
  console.log('test');
  res.json('test');
});

///Endpoint for generating new letter
app.get("/generateSuspensionLetter", async (req, res) => {
  const content = fs.readFileSync(
    path.resolve(__dirname, "./file/noticeTemplate.docx"),
    "binary"
  );
  const zip = new pizZip(content);
  const doc = new docxtemplater(zip);

  const data = {
    letterIndex: req.query.letterIndex,
    buildingName: req.query.buildingName,
    liftNumber: req.query.liftNumber,
    unitNumber: req.query.unitNumber,
    workCN: req.query.workCN,
    workEN: req.query.workEN,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    startTime: req.query.startTime,
    endTime: req.query.endTime,
  };

  console.log(data);

  doc.render(data);

  const output = doc.getZip().generate({ type: "nodebuffer" });
  fs.writeFileSync(
    path.resolve(
      __dirname,
      `./file/${data.buildingName}_${data.unitNumber}_${data.workEN}.docx`
    ),
    output
  );

  console.log("Success");
  res.send("Letter generated success");
});

app.post('/upload', async (req, res) => {

  try{
      

  }catch(e){
    console.log(e);
  }



});

const updateData = async (req, res) => {
  try {
    const file = await dfd.readExcel("./file/template/template.xlsx");
    const jsonData = dfd.toJSON(file);

    // DataFrame example
    // const df = new dfd.DataFrame(jsonData);
    // df.print();


// The issue is that jsonData.forEach() is an asynchronous function that does not block the execution of the console.log('Data Process updated') statement.
// This means that the code inside jsonData.forEach() will run in the background while the code after it continues to execute. As a result, console.log('Data Process updated') is executed before jsonData.forEach() is finished.
// To fix this, you can use a for...of loop instead of jsonData.forEach(). The for...of loop will wait for each iteration to finish before moving on to the next one, ensuring that all the data is processed before the console.log() statement is executed.

    for (let item of jsonData) {
      let newUnit = unitModel(item);
      const anyExisting = await unitModel
        .findOne({ unitNo: item.unitNo })
        .exec();

      if (anyExisting == null) {
        newUnit.save();
        console.log(`${item.unitNo} added`);
      } else {
        console.log(`${item.unitNo} already exists`);
      }
    }
    console.log("Data Process updated");
  } catch (e) {
    console.log(e);
  }
};

server.listen(PORT, () => {
  console.log("Server Connected");
});
