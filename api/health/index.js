module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: { status: 'ok', message: 'Backend server is running' }
  };
};
