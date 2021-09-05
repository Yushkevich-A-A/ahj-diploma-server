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
        let previousIndex = id - 10;
        if (previousIndex < 0) {
            previousIndex = 0;
        }
        return this.postsList.slice( previousIndex, id);
    },

    initSendPosts: function () {
        this.handlers.forEach(h => h({status: 'init', data: this.getPosts()}));
    }
}

module.exports = {
    db,
}