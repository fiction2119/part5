import React from "react"

const Notification = ({ message }) => {
  if (!message) return null
  return (
    <div className='notification'>
      <p data-testid='notification-id'>{message}</p>
    </div>
  )
}

export default Notification
