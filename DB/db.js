const db = {
    postsList: [
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now(),
            }
        },
        {
            type: 'text',
            data: {
                id: '1982-cskndhjnc-sdcsdhjd-sdokvsdj',
                content: 'Привет, мир!',
                date: +Date.now() + 5000000,
            }
        },
    ],

    postImage:[],
    postVideo: [],

    addNewPosts: function (data) {
        switch (data.type) {
            case 'video':
                this.postVideo.push(data.content);
                break;
            case 'image':
                this.postImage.push(data.content);
                break;
        }

        this.postsList.push(data);
    },

    getPosts: function (id) {
        const index = this.postsList.findIndex(item => item.data.id === id);
        const nextIndex = index + 1;
        return this.postsList.slice( nextIndex, nextIndex + 11);
    }
}

module.exports = {
    db,
}