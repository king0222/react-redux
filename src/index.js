import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import reducer from './reducers'
import App from './containers/App'
import DevTools from './containers/DevTools'
import './components/style.less'
import './components/style2.less'

//使用中间件thunk来执行函数结构的action
const middleware = [ thunk ]

//如果环境为产品环境，则添加日志
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger())
}

//创建store的方式千篇一律的，记住就好
const store = createStore(
  reducer,
  compose(
    applyMiddleware(...middleware),
    DevTools.instrument()
  )
)

//provider 添加store
render(
  <Provider store={store}>
  	<div>
    <App />
    <DevTools />
    </div>
  </Provider>,
  document.getElementById('root')
)
