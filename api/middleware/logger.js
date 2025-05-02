
// Enhanced debug middleware to log ALL requests in detail
const requestLogger = (req, res, next) => {
  console.log(`🔍 REQUEST: ${req.method} ${req.path}`);
  console.log('📋 HEADERS:', JSON.stringify(req.headers, null, 2));
  
  // Log body if present, but don't consume it
  const originalJson = req.json;
  req.json = async function(...args) {
    const body = await originalJson.apply(this, args);
    console.log('📦 PARSED JSON BODY:', JSON.stringify(body, null, 2));
    return body;
  };
  
  // Capture and log raw request body
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk.toString();
  });
  
  req.on('end', () => {
    if (rawBody) {
      console.log('📦 RAW BODY:', rawBody);
      try {
        const parsedBody = JSON.parse(rawBody);
        console.log('📦 PARSED BODY:', JSON.stringify(parsedBody, null, 2));
      } catch (e) {
        console.log('❌ Error parsing body as JSON:', e.message);
      }
    }
  });
  
  // Capture the original response methods to log responses
  const originalSend = res.send;
  const originalJson = res.json;
  const originalStatus = res.status;
  
  // Override status to log it
  res.status = function(code) {
    console.log(`🚦 RESPONSE STATUS: ${code}`);
    return originalStatus.apply(this, arguments);
  };
  
  // Override send to log the response body
  res.send = function(body) {
    console.log('📤 RESPONSE BODY:', body);
    return originalSend.apply(this, arguments);
  };
  
  // Override json to log the response JSON
  res.json = function(json) {
    console.log('📤 RESPONSE JSON:', JSON.stringify(json, null, 2));
    return originalJson.apply(this, arguments);
  };
  
  next();
};

module.exports = {
  requestLogger
};
