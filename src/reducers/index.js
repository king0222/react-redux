import { combineReducers } from 'redux'
import {
  SELECT_REDDIT, INVALIDATE_REDDIT,
  REQUEST_POSTS, RECEIVE_POSTS
} from '../actions'

/**
 * 当界面VIEW触发某个action的时候(dispatch(action)),就会调用到reducers这里的每一个reducer(注意这里说的是每一个，即所有)，
 * 需要理解的是每一个reducer所接受到的action参数将会一致，但是state是不同的，每一个reducer所接收的state只是完整state树种对应的一个枝节
 * 理解了上面的意思，也就搞懂了redux的处理流程了。
 */


//参数state表示初始数据，这个api表示获取选中的类别，在这里设置了默认的selectedReddit值为reactjs
const selectedReddit = (state = 'reactjs', action) => {
  switch (action.type) {
    case SELECT_REDDIT:
      return action.reddit
    default:
      return state
  }
}

//获取文章列表,初始化数据state各个数据基本为空，这就很好理解了
//invalidate表示无效， didinvalidate表示确实无效
const posts = (state = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action) => {
  switch (action.type) {
    case INVALIDATE_REDDIT: //如果无效，则返回初始数据，并添加didInvalidate字段，并设置为true
      return {
        ...state,
        didInvalidate: true
      }
    case REQUEST_POSTS: //发起请求，返回初始数据，并添加isFetching,didInvalidate字段，并设置为true, didInvalidate为true
      return {
        ...state,
        isFetching: true,
        didInvalidate: false
      }
    case RECEIVE_POSTS: //请求成功后，并添加isFetching,didInvalidate字段, didInvalidate为false,数据item为action的posts,
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        items: action.posts,
        lastUpdated: action.receivedAt
      }
    default: //其他情况下返回初始的state
      return state
  }
}

//定义初始state是一个空对象，返回{'reactjs': {}}数据节点
const postsByReddit = (state = { }, action) => {
  console.log('请求了一次！action is:', action)
  switch (action.type) {
    case INVALIDATE_REDDIT:
    case RECEIVE_POSTS:
    case REQUEST_POSTS:
      return {
        ...state,
        [action.reddit]: posts(state[action.reddit], action)
      }
    default:
      return state
  }
}

/*state['reactjs'] = {
  isFetching,
  didInvalidate,
  items
}*/


/*这里就相当于定义了真个应用程序的数据树结构
dataTree = {
  postsByReddit: postsByReddit,
  selectedReddit: selectedReddit
}*/
//每一个reducer都是对应一个数据节点
const helloWorld = (state = 'hello world', action) => {
  return state
}

//可以利用combineReducers来生成完整的state树
//其实也就是返回：state = {postsByReddit, selectedReddit, helloWorld}
const rootReducer = combineReducers({
  postsByReddit,
  selectedReddit,
  helloWorld
})

export default rootReducer
