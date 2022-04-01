# Economictimes-news-scraper



Scrape news from https://economictimes.indiatimes.com/

## Instructions
1. Download the code from repository
2. Run `npm install`
3. Change the follwing values in the file
```
starttime = date from which scraping should begin
endtime = date on which scraping should end
filename = name of the output csv file
batchsize = number of news articles that should be scraped asynchronously (high if network speed is good, low otherwise)
```
4. Run the file using `node`

-----
The starttime and endtime numbers can be found by navigating to any day from the archives (https://economictimes.indiatimes.com/archive.cms) and copying the starttime parameter from the url.
