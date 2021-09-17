const webpush = require('web-push');

const options = {
  vapidDetails: {
    subject: 'http://127.0.0.1:8080',
    publicKey: 'BBc7Bb5f5CRJp7cx19kPHz5d9S5jFSzogxEj2V1C44WuhTwd78tnXLPzOxGe0bUmKJUTAMemSKFzyQjSBN_-XyE',
    privateKey: 'tBoppvhj9A9NO0ZrFsPiH_CoAZ84TagjxiKyGjR4V8w'
  },
  TTL: 5000
};

const pushSubscription = null; // @ToDo

const payload = JSON.stringify({
  notification: {
    title: 'Your Gate Changed',
    body: 'Your Gate is now G62',
    icon: './assets/bed.png',
    data: 'additional data'
  }
});

webpush.sendNotification(pushSubscription, payload, options);
