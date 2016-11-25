export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_REDDIT = 'SELECT_REDDIT'
export const INVALIDATE_REDDIT = 'INVALIDATE_REDDIT'

//正常的action，最简单的action形式，直接返回一个object,包含type属性来区分action种类，创建函数可以有任意多个参数，参数实为传入的数据
//这里的action传入要选择的数据,返回数据:'reactjs' or 'frontend'
export const selectReddit = reddit => ({
  type: SELECT_REDDIT,
  reddit
})

//这里的action传入非法的数据
//dispatch(action.invalidateReddit) 返回数据：'reactjs' or 'frontend'
//invalidate意思是无效
//didInvalidate意思是确实无效
export const invalidateReddit = reddit => ({
  type: INVALIDATE_REDDIT,
  reddit
})

//发起异步请求 返回数据: 'reactjs' or 'frontend'
export const requestPosts = reddit => ({
  type: REQUEST_POSTS,
  reddit
})

//异步请求成功，返回数据, reddit应该是请求的参数，根据参数返回不一样的数据，相当于过滤吧
//返回数据：obj = {type: 'RECEIVE_POSTS', 'reactjs': 'reactjs', posts: [], receivedAt: Date.now()}
//在action中仅仅返回服务端所关联的数据，状态什么的不管他，比如isFetching, invalidate什么的
export const receivePosts = (reddit, json) => ({ 
  type: RECEIVE_POSTS,
  reddit,
  posts: json.data.children.map(child => child.data), //数据提取，提取异步请求返回数据中的data中的data字段
  receivedAt: Date.now()
})


//下面的fetchPosts, fetchPostsIfNeeded称为action createor, 在被store dispatch之后，他们并不会被传递到reducer中，只有真正的action才能被传到reducer中执行
//豁然开朗啊，你妹的
//应该是固定模式的写法 处理异步请求，dispatch receivePosts
const fetchPosts = reddit => dispatch => {
  dispatch(requestPosts(reddit))
  return fetch(`https://www.reddit.com/r/${reddit}.json`)
    .then(response => response.json())
    .then(json => dispatch(receivePosts(reddit, json)))
}



//是否应该提取数据，这个方法判断是否使用缓存中的数据
const shouldFetchPosts = (state, reddit) => {
  /*state.postsByReddit = {
    'reactjs': {

    },
    'frontend': {

    }
  }*/
  //如果缓存没有数据则进行异步提取
  const posts = state.postsByReddit[reddit]
  if (!posts) {
    return true
  }
  //如果缓存存在，并且isFetching为真则不进行异步提取操作
  if (posts.isFetching) {
    return false
  }
  //如果缓存存在，并且isFetching为false,则返回是否无效
  return posts.didInvalidate
}

export const fetchPostsIfNeeded = reddit => (dispatch, getState) => {
  if (shouldFetchPosts(getState(), reddit)) {
    return dispatch(fetchPosts(reddit))
  }
}
