module.exports = (error, ret) => {
  if (ret.code === 200) ret.code = 500
  if (ret.code === 500) ret.messages.push('Erro interno')
  ret.error = true
  if (error.message) ret.messages.push(error.message)
  return ret
}
