exports.handler = function(context, event, callback) {
  
    // Add the NodeJS Helper Library by calling context.getTwilioClient()
    const client = context.getTwilioClient();
   
    // Create a custom Twilio Response
    // Set the CORS headers to allow Flex to make an HTTP request to the Twilio Function
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // Use the NodeJS Helper Library to make an API call.
    // Note how you are passing SIDs using a key from the event parameter.
    client.conferences(event.conferenceSid)
      .participants
      .list({limit: 20})
      .then(participants => {
          // Retun the first 20 participants back, list will show the coach
          response.appendHeader('Content-Type', 'application/json');
          response.setBody(participants);
          // Return a success response using the callback function.
          callback(null, response);
      })
      .catch(err => {
          response.appendHeader('Content-Type', 'plain/text');
          response.setBody(err.message);
          response.setStatusCode(500);
          // If there's an error, send an error response
          // Keep using the response object for CORS purposes
          callback(null, response);
      });
  };
  