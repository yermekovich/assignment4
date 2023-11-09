const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Article = require('./models/article');
const https = require("https");
const app = express();
const axios = require('axios');
const _ = require('lodash');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

mongoose.connect(   
    'mongodb+srv://n2vermor2:12345@cluster0.4ahzcy2.mongodb.net/web2?retryWrites=true&w=majority',
).then(()=>{
    console.log('DB OK');
})
.catch((err)=>{
    console.log('DB ERROR', err);
});

app.get('/articles/new', (req, res)=>{
    res.render("new");
})


app.get('/inspiration', async(req,res)=>{
    let fact, title, date, url;
    let quote, name, nationality, profession, born;
    const options1 = {
        method: 'POST',
        url: 'https://quotel-quotes.p.rapidapi.com/quotes/qod',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': '492c4f7e79msh3667e216fd3e180p1ebfa9jsn026a70efce8f',
          'X-RapidAPI-Host': 'quotel-quotes.p.rapidapi.com'
        },
        data: {topicId: Math.floor(Math.random()*100)}
      };
      try {
        const response2 = await axios.request(options1);
        let q = response2.data;
        
        console.log(q)
        quote = q.quote;
        name = q.name;
        nationality = q.nationality;
        profession = q.profession;
        born = q.born;
      } catch (error) {
        console.error(error);
      }
    const options2 = {
        method: 'GET',
        url: 'https://today-in-history.p.rapidapi.com/thisday',
        headers: {
            'X-RapidAPI-Key': '492c4f7e79msh3667e216fd3e180p1ebfa9jsn026a70efce8f',
            'X-RapidAPI-Host': 'today-in-history.p.rapidapi.com'
        }
    };
    try {
        const response = await axios.request(options2);
            console.log(response.data)
            fact = response.data.article;
            title = _.toUpper(fact.title);
            date = fact.date; 
            url = fact.url;
    } catch (error) {
        console.error(error);
    }
    console.log(title + " " + date+ " " + url + " " + quote + " " + name + " " + nationality + " " + profession + " " + born);
    res.render('inspiration', {t: title, d: date, u: url, qu:quote, n:name, nat: nationality, p:profession, b:born});
});

app.post('/inspiration', async (req, res)=>{
    res.redirect('/inspiration');
})
app.post('/articles', async (req, res) => {
    const newArticle = new Article({
        title: req.body.title,
        description: req.body.description
    });
    newArticle.save()
    .then(()=>{
        res.redirect('/');
        console.log('Статья сохранилась');
    })
    .catch(error => {
        console.error('Ошибка при сохранении статьи:', error);
    });
});

app.get('/', (req, res)=>{
    Article.find({})
    .then(articles => {
        res.render('blog', { articles: articles });
    })
    .catch(error => {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    });
});

app.delete('/articles/:id', async (req, res) => {
    try {
        const articleId = req.params.id;
        const deletedArticle = await Article.findByIdAndDelete(articleId);

        if (!deletedArticle) {
            console.log('Статья не найдена');
            return res.status(404).send('Статья не найдена');
        }

        console.log('Статья успешно удалена');
        return res.send(`Статья с ID ${articleId} успешно удалена`);
    } catch (error) {
        console.error('Произошла ошибка при удалении статьи');
        return res.status(500).send('Произошла ошибка при удалении статьи');
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, (e)=>{
    if(e){
        console.log(e);
    }
    console.log("Server OK");
});