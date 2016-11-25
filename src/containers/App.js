import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { selectReddit, fetchPostsIfNeeded, invalidateReddit } from '../actions'
import Picker from '../components/Picker'
import Posts from '../components/Posts'

class App extends Component {


  componentDidMount() {
    const { dispatch, selectedReddit } = this.props
    //触发fetchPostsIfNeed方法，selectedReddit在reducers中设置了默认值为'reactjs'
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  componentWillReceiveProps(nextProps) {
    //如果选中的项目跟原来的项目不同则触发fetchPostsIfNeeded
    if (nextProps.selectedReddit !== this.props.selectedReddit) {
      const { dispatch, selectedReddit } = nextProps
      dispatch(fetchPostsIfNeeded(selectedReddit))
    }
  }
  //比较好奇的是这个nextReddit是怎么传递进去的，我操
  handleChange(nextReddit) {
    this.props.dispatch(selectReddit(nextReddit))
    //上面的这行代码相当于：
    //const {dispatch} = this.props
    //dispatch(selectReddit(nextReddit))
  }

  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch, selectedReddit } = this.props
    //触发无效动作，但是触发这个有毛用呢，还没看出来
    console.log('dispatch invalidateReddit')
    dispatch(invalidateReddit(selectedReddit))
    //触发fetchPostsIfNeed动作
    console.log('dispatch fetchPostsIfNeed')
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  render() {
    const { selectedReddit, posts, isFetching, lastUpdated } = this.props
    const isEmpty = posts.length === 0
    return (
      <div>
        <Picker value={selectedReddit}
                onChange={this.handleChange.bind(this)}
                options={[ 'reactjs', 'frontend' ]} />
        <p>
          {lastUpdated &&
            <span>
              上次更新的时间为: {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>
          }
          {!isFetching &&
            <a href="#"
               onClick={this.handleRefreshClick.bind(this)}>
              Refresh it
            </a>
          }
        </p>
        {isEmpty
          ? (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          : <div style={{ opacity: isFetching ? 0.5 : 1 }}>
              <Posts posts={posts} />
            </div>
        }
      </div>
    )
  }
}


App.propTypes = {
    selectedReddit: PropTypes.string.isRequired,
    posts: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    dispatch: PropTypes.func.isRequired
  }


//这个state是通过全局store树提供的，表示了完整的数据结构。
const mapStateToProps = state => {
  const { selectedReddit, postsByReddit } = state

  //es6语法
  //定义三个变量isFetching, lastUpdated, posts,其中posts = obj.items
  //这里暴露的几个数据应该是根据上面 APP的业务逻辑需要而定的，上面UI逻辑需要什么样的数据这里就暴露出什么样的数据
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsByReddit[selectedReddit] || {
    isFetching: true,
    items: []
  }

  return {
    selectedReddit,
    posts,
    isFetching,
    lastUpdated
  }
}

//这里是react和redux的连接,connect函数中所带的参数实一个函数，而这个函数默认会携带完整的state作为参数
//mapStateToProps的作用是从新解构state数据，分配app中可用的属性
export default connect(mapStateToProps)(App)
