import express from "express";
import fetch from 'node-fetch';
const app = express();
import ejs from "ejs";
import bodyParser from "body-parser";
import lodash from "lodash"
app.locals.lodash = lodash;
app.use(bodyParser.urlencoded({extended:true}))
import * as dotenv from 'dotenv'
dotenv.config()
import json from "body-parser"


app.set("view engine", "ejs")
app.use(express.static("public"))


    
 
app.get("/", function(req, res){
    res.render("index.ejs")
})

app.get("/start", async function(req, res){
    try{
        const data = await fetch(`http://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${process.env.API_KEY}`)
        const jsonData = await data.json() 
        const pronounciationOfRandWord = await fetch(`http://api.wordnik.com/v4/word.json/${jsonData.word}/pronunciations?api_key=${process.env.API_KEY}`)
        var transcription = await pronounciationOfRandWord.json()
        if(transcription.statusCode == 404){
            transcription = {
                raw:"No transcription found."
            }
        }else{
            transcription = transcription[transcription.length-1]
        }
        const word = lodash.upperFirst(jsonData.word)
        res.render("start", {word:word, dicWord:jsonData, transcription:transcription})
        }catch(e){
            console.log(e)
        }
    

    // res.render("start", {wordOfTheDay:word})
})

app.post("/search", async function(req, res){
    const wordToSearch = lodash.lowerCase(req.body.search)
    try{
    const data = await fetch(`http://api.wordnik.com/v4/word.json/${wordToSearch}/definitions?api_key=${process.env.API_KEY}&sourceDictionaries=wiktionary`)
    const jsonData = await data.json()
    if(data.status == 404){
        res.render("error")
    }
    const pronounciationOfSearchWord = await fetch(`http://api.wordnik.com/v4/word.json/${wordToSearch}/pronunciations?api_key=${process.env.API_KEY}`)
   
    var transcription = await pronounciationOfSearchWord.json()
    
    if(transcription.statusCode == 404){
        transcription = {
            raw:"No transcription found."
        }
    }else{
        transcription = transcription[transcription.length-1]
    }
    
  
    const word = lodash.upperFirst(wordToSearch)
    
    res.render("search", {word:word, dicWord:jsonData, transcription:transcription})
        
    }catch(e){
        console.log(e)
}
})

app.listen(process.env.PORT || 3000, console.log("rest"))