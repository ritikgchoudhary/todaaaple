class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = 400;
    }
  }
  
 export default ErrorResponse;