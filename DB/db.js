const { getWeather } = require('./weather');
const { getCites } = require('./cites')
const { emergency } = require('./emergency')
const { taxi } = require('./taxi')
const { exchangeRate } = require('./exchangeRate')

const db = {
    postId: 0,

    postsList: [],
    postsImage:[],
    postsVideo: [],
    postsAudio: [],
    notifications: [],

    getId: function() {
        const currentId = this.postId;
        this.postId++;
        return currentId;
    },

    addNewPosts: function(data) {
        const newPostData = data;

        if (newPostData.type === 'notification') {
            this.notifications.push(newPostData);
            this.handlers.forEach(h => h(newPostData));
            return;
        }

        if (newPostData.type === 'chaos') {
            const response = {
                type: newPostData.type,
            };
            switch (newPostData.data.type) {
                case 'погода':
                    response.data = getWeather();
                    break;
                case 'курс':
                    response.data = exchangeRate;
                    break;
                case 'экстренно':
                    response.data = emergency;
                    break;
                case 'цитата':
                    response.data = getCites();
                    break;
                case 'такси':
                    response.data = taxi;
                    break;
            }
            this.handlers.forEach(h => h(response));
            return;
        }



        newPostData.data.id = this.getId();
        switch (newPostData.type) {
            case 'video':
                this.postsVideo.push(newPostData.data.content.link);
                break;
            case 'image':
                this.postsImage.push(newPostData.data.content.link);
                break;
            case 'audio':
                this.postsAudio.push(newPostData.data.content.link);
                break;
        } 

        this.postsList.push(newPostData);
        this.handlers.forEach(h => h(newPostData));
      },

      
    handlers: [],
    
    listen: function(handler) {
    this.handlers.push(handler);
    },

    getPosts: function (id = this.postsList.length) {
        let previousIndex = id - 10;
        if (previousIndex < 0) {
            previousIndex = 0;
        }
        return this.postsList.slice( previousIndex, id);
    },

    initSendPosts: function () {
        this.checkNotifications();
        this.handlers.forEach(h => h({status: 'init', data: this.getPosts(), notifications: this.notifications}));
    },
    // Очистка памяти уведомлений
    checkNotifications() {
        const deleteNotifications = this.notifications.filter(item => item.data.date < Date.now());
        for(let i of deleteNotifications) {
            this.notifications.splice(this.notifications.findIndex(item => item.data.date === i.data.date), 1)
        }
    }
}

module.exports = {
    db,
}