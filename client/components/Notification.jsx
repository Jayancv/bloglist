const Notification = ({ error, message }) => {
  const notificationStyle = {
    backgroundColor: 'lightgrey',
    color: 'green',
    fontSize: '20px',
    borderStyle: 'solid',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px',
  }
  const errorStyle = {
    backgroundColor: 'lightgrey',
    color: 'red',
    fontSize: '20px',
    borderStyle: 'solid',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px',
  }

  if (!message) {
    return null
  }

  return <div style={error ? errorStyle : notificationStyle}>{message}</div>
}

export default Notification
