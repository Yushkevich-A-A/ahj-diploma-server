const db = {
    postId: 0,

    postsList: [],
    postsImage:[],
    postsVideo: [],
    postsAudio: [],

    getId: function() {
        const currentId = this.postId;
        this.postId++;
        return currentId;
    },

    addNewPosts: function(data) {
        const newPostData = data;
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
        const nextIndex = id - 10;
        return this.postsList.slice( nextIndex, id);
    },

    initSendPosts: function () {
        this.handlers.forEach(h => h({status: 'init', data: this.getPosts()}));
    }
}


// module.exports = {
//     eventSubscription: {
//       data: [],
//       add: function(item) {
//         this.data.push(item);
//         this.handlers.forEach(h => h(item));
//       },

//       handlers: [],

//       listen: function(handler) {
//         this.handlers.push(handler);
//       },
//       getAllData: function() {
//         this.handlers.forEach(h => h({status: 'init', data: this.data}));
//       }
//     },
//   }

module.exports = {
    db,
}