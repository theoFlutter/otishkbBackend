const express = require("express");
const http = require("http");
const axios = require("axios");
const app = express();
const server = http.createServer(app);
const cors = require("cors");
const XLSX = require('xlsx');
const dotenv = require('dotenv');
dotenv.config();

//const fs = require("fs");
const fs = require('@cyclic.sh/s3fs/promises')(process.env.CYCLIC_BUCKET_NAME);
const path = require("path");
const pizZip = require("pizzip");
const docxtemplater = require("docxtemplater");

const unitModel = require("./model/unit_model");

const PORT = process.env.PORT || 3000;

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

const DB = mongoose
  .connect(
    "mongodb+srv://otishkb:otishkb@hkb.ufaln9r.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database is running");

    //uploadData();
    //dataHandling();

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

    app.get("/fetchUnitDetail/:id", async (req, res) => {
      try {
        let {id} = await req.params;
        let data = await unitModel.findById(id);
        res.status(200).json(data);

      } catch (e) {
        res.status(404).send(e);
      }
    });

    app.patch("/editData/:id", async (req, res) =>{
      try{
        let {id} = await req.params;
        let object = await req.body;
        await unitModel.findByIdAndUpdate(id, object);
        console.log('Update susscess'); 
      }catch(e){
        res.status(404).send(e);
      }
    })

    app.get("/", async (req, res) => {
      res.send('Test');

    });

    app.get('/contents', async (req, res) => {
      XLSX.read(fs.readFileSync("test.xlsx"));
      console.log('File read');
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
          uploadData();
      }catch(e){
        console.log(e);
      }
    });

    app.get('/write', async (req, res) => {
      fs.writeFileSync('my_file.txt', new Date().toISOString())
      return res.send('Hello World!');
  });
  
  app.get('/contents', async (req, res) => {
      console.log('/contents route')
      let content = fs.readFileSync('my_file.txt').toString()
       
      return res.send(content);
  });

    app.get('/downloadCustomerData', async(req, res)=>{

      let jsonData = await unitModel.find();
      let customerData = jsonData.map(row=>({
        unitNo: row.unitNo,
        unitName: row.unitName,
        customerName: row.customerName,
        customerAdd: row.customerAdd,
        customerfax: row.customerfax,
        customerMainContact: row.customerMainContact,
        customerMainContactTel: row.customerMainContactTel,
        customerMainContactEmail: row.customerMainContactEmail,
        customerSecondContact: row.customerSecondContact,
        customerSecondContactTel: row.customerSecondContactTel,
        customerSecondContactEmail: row.customerSecondContactEmail,
        customerRemarks: row.customerRemarks,
      }));

      let newWS = XLSX.utils.json_to_sheet(customerData);
      let newWB = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWB, newWS, 'CustomerData');
      console.log('1');
      let buffer = XLSX.write(newWB, {bookType: "xlsx", type: 'buffer'});
      console.log('2');
      fs.writeFileSync("CustomerData.xlsx", buffer);
      console.log('3');
      // fs.writeFile(newXlsx);

      // let newWS = XLSX.utils.json_to_sheet(json);
//       let newWB = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(newWB, newWS, 'Sheet 1');
//       XLSX.writeFile(newWB, "test.xlsx");
//       console.log('Write Success');

      // console.log("Write file success")
      // XLSX.read(fs.readFileSync("CustomerData.xlsx"));
      res.download("CustomerData.xlsx");

    })





    server.listen(PORT, () => {
      console.log("Server Connected");
    });

  })
  .catch((e) => {
    console.log(e);
  });


const uploadData = async (req, res) => {
  try {

    const workbook = await XLSX.readFile(path.resolve(__dirname, "./file/template/template.xlsx"));
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

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


