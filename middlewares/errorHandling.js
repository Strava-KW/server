function errorHandlers(err, req, res, next){
  if (err.errors) {
    let errors = Object.keys(err.errors)
    let messages = []
    errors.map(error => {
      messages.push(err.errors[error].message)
    })
    res.status(400).json({message: messages})
  }
  else if(err.status){
    res.status(err.status).json({message: err.message})
  }
  else {
    console.log(err )
    res.status(500).json({message: "Internal Server Error"})
  }
};

module.exports = errorHandlers