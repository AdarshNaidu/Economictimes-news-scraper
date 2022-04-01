const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const fastcsv = require('fast-csv')

const domain = 'https://economictimes.indiatimes.com'

// you can get start time and end times by navigating to any day of the archives
// https://economictimes.indiatimes.com/archive.cms
// and copying the starttime parameter from the url.
const start_time = 43101
const end_time = 43465

// url of a page that displays list of news articles on a particular day.
const get_day_url = (time) => `https://economictimes.indiatimes.com/archivelist/starttime-${time}.cms`

const filename = 'news_2018'

const main = async () => {
    try {

        const csvStream = fastcsv.format({ headers: true });
        const stream = fs.createWriteStream(__dirname + `/${filename}.csv`)
        csvStream.pipe(stream)
    
        // contentArray = []
        curr = start_time
    
        while(curr <= end_time) {

            process.stdout.write("Processing day: " + curr + "\r");

            const day_url = get_day_url(curr)

            const day_articles = await scrape_day(day_url)

            // contentArray.push(...day_articles)
            for (article of day_articles) {
                csvStream.write(article)
            }

            curr += 1
        }
        
        // fs.writeFile("news_2021_jan_june.json", JSON.stringify(contentArray, null, 2), (err) => {
        //     if (err) {
        //         console.log('write array to json error')
        //         console.log(err.message)
        //         return;
        //     }
        //     console.log("Successfully written data to file");
        // });

    } catch (err) {
        console.log('main function error')
        console.log(err.message)
    }

}

// scrape all the articles on a particular day
const scrape_day = async (url) => {
    try{

        articlesArray = []
        
        const { data } = await axios.get(url);
        
        const $ = cheerio.load(data);
        
        content = $('.content a')
        
        promiseArray = []

        // some links appear twice in the page, same title but different urls
        // this set is used to detect the duplicates
        title_set = new Set()

        // set the batch size depending on the processing power and internet speed.
        // more the batch size more the speed.
        let batch_size = 100
        let i = 0

		for (let elem of content) {
			news_link = $(elem).attr('href')
            news_title_encoding = news_link.match(/[^/]*\/articleshow/)[0].slice(0, -("/articleshow".length))
            if(!title_set.has(news_title_encoding)){
                if(i == batch_size) {
                    articlesArray.push(...(await Promise.all(promiseArray)))
                    promiseArray = []
                    i = 0
                }
                title_set.add(news_title_encoding)
                promiseArray.push(new Promise(async (resolve, reject) => {
                    news_detail = await scrape_page(domain + news_link)
                    resolve({...news_detail})
                }))
                i++
            }
		}
        
        return articlesArray
        
    } catch(err) {
        console.log('scrape day error')
        console.log(err.message)
    }
}


// scrape news details from a particular news page
const scrape_page = async (url) => {

    try{

        object = {}

        const { data } = await axios.get(url);
        
        const $ = cheerio.load(data);

        
        title = $('h1.artTitle')
        object.title = title.text()

        body = $('div.artText')
        bodyText = body.text().replace(/(\r\n|\n|\r)/gm,"") // remove line breaks
        
        // Economic times premium article
        if( $('#pricePlan').length ){
            summary = $('.artSyn p')
            object.summary = summary.text()

            object.body = "Partial body: " + bodyText

            time = $('time')
            object.updatedAt = time.text()
        } else {
            summary = $('h2.summary')
            object.summary = summary.text()

            object.body = bodyText

            time = $('time')
            object.updatedAt = time.text().substr(14)
        }

        object.url = url

        return object

    } catch (err) {
        console.log('scrape page error')
        console.log(err.message)
    }
}


main()