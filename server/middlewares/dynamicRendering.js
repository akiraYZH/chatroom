const isbot = require('isbot'); // Lib for bots judgement
const puppeteer = require('puppeteer'); // Prerender lib

/**
 *  @description This middleware is for dynamic rendering. It detects request's user agent, if it is a crawler,
 *               return a prerendered page. If it is a normal user, proceed to normal apis. 
 * 
 */
 module.exports =  async function(req, res, next) {
    let processTime = 0; // total process time
    let startTime = Date.now();
    let port = req.app.settings.port || cfg.port;
    const useragent = req.get('User-Agent'); // user agent of the client
    const fullUrl = req.protocol + '://' + 
                    req.get('host').substring(0, req.get('host').indexOf(":") === -1 ? req.get('host').length : req.get('host').indexOf(":")) + 
                    ( port == 80 || port == 443 ? '' : ':'+port ) + 
                    req.originalUrl; //url to render
    console.log(port);
    try {
        // if it is a crawler and it is not the page we create(the page we create will add [prerender] header)
        if(isbot(useragent) && req.headers.prerender === undefined){
            try{
                // create a headless browser, 
                const browser = await puppeteer.launch({
                    headless: true,
                    ignoreHTTPSErrors: true,
                    args: [
                        '--no-sandbox'
                    ]
                });
                const page = await browser.newPage(); // open a page in the browser
                await page.setUserAgent(useragent); // set the user agent of the page, because frontend needs it to render
                await page.setExtraHTTPHeaders({prerender:'true'}); // set extra header [prerender] for all requests called by this page
                await page.goto(fullUrl,{waitUntil:'load', timeout: 0}); // go to the target url
                
                const html = await page.content(); //get the page html
                await browser.close(); //close the browser, because puppeteer use websocket, the browser instance need to be closed
                processTime = Date.now() - startTime;
                console.log(`Headless rendered page in: ${processTime}ms`);
                res.send(html);
            }catch(e){
                console.log('ssr failed', e);
                res.status(500).send('Server error');
            }
        }else {
            next();
        }
    } catch (err){
        console.log(err, "middleware: dynamicRenderForBots error");
    }
}