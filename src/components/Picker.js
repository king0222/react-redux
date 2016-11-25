import React, { PropTypes } from 'react'

//这里没有使用react-component组件在创建组件，而是仅仅使用函数的方式返回jsx创建组件，相当简易的形式
const Picker = ({ value, onChange, options }) => (
  <span>
    <h1>{value}</h1>
    <select onChange={e => onChange(e.target.value)}
            value={value} className="select">
      {options.map(option =>
        <option value={option} key={option}>
          {option}
        </option>)
      }
    </select>
  </span>
)

Picker.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default Picker
