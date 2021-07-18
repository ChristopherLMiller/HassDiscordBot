var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var axios = require('axios');

let url = 'https://millerresidence.site/api';
let password = 'millerhouse';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('disconnect', function(errMsg, code) {
  logger.error(errMsg);
  logger.error(code);
})

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
              bot.sendMessage({
                  to: channelID,
                  message: 'Pong!'
              });
              break;

            case 'speedtest':
              bot.sendMessage({
                  to: channelID,
                  message: 'Speedtest Results'
                });
              axios.get(`${url}/states/sensor.speedtest_download?api_password=${password}`)
              .then(function (response) {
                bot.sendMessage({
                  to: channelID,
                  message: `Download - ${response.data.state}mb/s`
                });
              });
              axios.get(`${url}/states/sensor.speedtest_upload?api_password=${password}`)
              .then(function (response) {
                bot.sendMessage({
                  to: channelID,
                  message: `Upload - ${response.data.state}mb/s`
                });
              });
              axios.get(`${url}/states/sensor.speedtest_ping?api_password=${password}`)
              .then(function (response) {
                bot.sendMessage({
                  to: channelID,
                  message: `Latency - ${response.data.state}ms`
                });
              });
              break;

            // turn device on/off
            case 'turn':
              let state = args[0]
              let entity = args[1].split('.')[1];
              let type = args[1].split('.')[0];
              
              // we have the data we need, lets form the axios request
              var full_url = `${url}/services/${type}/turn_${state}?api_password=${password}`;
              axios.post(full_url, {
                entity_id: `${type}.${entity}`,
              })
              .then(function (response) {
                bot.sendMessage({
                  to: channelID,
                  message: `Turning ${state} ${entity} ${type}`
                });
              })
              .catch(function (error) {
                bot.sendMessage({
                  to: channelID,
                  message: `Unable to turn ${state} ${entity}`
                })
              })
            break;

            // default
            default:
              bot.sendMessage({
                to: channelID,
                message: "Unable to process"
              });
              break;

         }
     }
});